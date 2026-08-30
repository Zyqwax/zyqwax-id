import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canChangeAvatar } from '@/lib/rateLimit/profileFields';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { badRequest, errorResponse, profileRateLimited } from '@/lib/server/route-utils';
import { safeUser } from '@/lib/server/http';
import { getCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
const avatarSchema = z.object({ avatarUrl: z.string().trim().url().max(2048), avatarPublicId: z.string().trim().min(1).max(255) });

// Cloudinary'de gerçek yükleme istemciden yapılır; bu endpoint yalnızca güvenilir sonucu kaydeder.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const limit = canChangeAvatar(user.avatarChangeCount, user.avatarChangeWindowStart);
    if (!limit.allowed) {
      const nextAllowedAt = user.avatarChangeWindowStart ? new Date(user.avatarChangeWindowStart.getTime() + 24 * 60 * 60 * 1000) : undefined;
      return profileRateLimited(nextAllowedAt);
    }
    const parsed = avatarSchema.safeParse(await request.json());
    if (!parsed.success || parsed.data.avatarPublicId !== `avatars/${user.id}`) return badRequest('geçersiz avatar bilgisi');
    const windowExpired = !user.avatarChangeWindowStart || user.avatarChangeWindowStart.getTime() + 24 * 60 * 60 * 1000 <= Date.now();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: parsed.data.avatarUrl,
        avatarPublicId: parsed.data.avatarPublicId,
        ...(windowExpired ? { avatarChangeCount: 1, avatarChangeWindowStart: new Date() } : { avatarChangeCount: { increment: 1 } }),
      },
    });
    return NextResponse.json({ user: safeUser(updated) });
  } catch (error) { return errorResponse(error); }
}

// Avatar silmeyi de günlük iki değişiklik hakkından biri olarak sayar ve Cloudinary kaydını kaldırır.
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user.avatarPublicId) return badRequest('zaten avatar yok');
    const limit = canChangeAvatar(user.avatarChangeCount, user.avatarChangeWindowStart);
    if (!limit.allowed) {
      const nextAllowedAt = user.avatarChangeWindowStart ? new Date(user.avatarChangeWindowStart.getTime() + 24 * 60 * 60 * 1000) : undefined;
      return profileRateLimited(nextAllowedAt);
    }
    await getCloudinary().uploader.destroy(user.avatarPublicId);
    const windowExpired = !user.avatarChangeWindowStart || user.avatarChangeWindowStart.getTime() + 24 * 60 * 60 * 1000 <= Date.now();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: null,
        avatarPublicId: null,
        ...(windowExpired ? { avatarChangeCount: 1, avatarChangeWindowStart: new Date() } : { avatarChangeCount: { increment: 1 } }),
      },
    });
    return NextResponse.json({ user: safeUser(updated) });
  } catch (error) { return errorResponse(error); }
}
