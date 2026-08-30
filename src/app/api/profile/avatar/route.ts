import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canChangeAvatar } from '@/lib/rateLimit/profileFields';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, profileRateLimited } from '@/lib/server/route-utils';
import { safeUser } from '@/lib/server/http';

export const runtime = 'nodejs';
const avatarSchema = z.string().trim().url().max(2048);

// Cloudinary upload'u bu endpoint'in dışında yapılır; burada yalnızca yüklenmiş URL kaydedilir.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const limit = canChangeAvatar(user.avatarChangeCount, user.avatarChangeWindowStart);
    if (!limit.allowed) return profileRateLimited();
    const body = await request.json();
    const parsed = avatarSchema.safeParse(body?.avatarUrl);
    if (!parsed.success) return errorResponse(parsed.error);
    const windowExpired = !user.avatarChangeWindowStart || user.avatarChangeWindowStart.getTime() + 24 * 60 * 60 * 1000 <= Date.now();
    // Gerçek Cloudinary widget/imzalı upload entegrasyonu sonraki görevde eklenecek.
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: parsed.data,
        ...(windowExpired ? { avatarChangeCount: 1, avatarChangeWindowStart: new Date() } : { avatarChangeCount: { increment: 1 } }),
      },
    });
    return NextResponse.json({ user: safeUser(updated) });
  } catch (error) { return errorResponse(error); }
}
