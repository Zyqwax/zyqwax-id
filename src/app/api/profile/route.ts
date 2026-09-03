import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { clearRefreshCookie } from '@/lib/server/cookies';
import { errorResponse, requireSameOrigin } from '@/lib/server/route-utils';
import { getCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const deleteSchema = z.object({ confirmation: z.literal('HESABIMI SİL') });

// Hesap silme geri alınamaz; yalnızca oturum sahibi ve aynı-kökenli istek çalıştırabilir.
export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const user = await getAuthenticatedUserFromRequest(request);
    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'hesap silme onayı geçersiz' }, { status: 400 });

    await prisma.user.delete({ where: { id: user.id } });

    if (user.avatarPublicId) {
      try {
        await getCloudinary().uploader.destroy(user.avatarPublicId);
      } catch {
        // Hesap verisi silindiyse harici avatar temizliği silmeyi başarısız kılmamalı.
      }
    }

    const response = NextResponse.json({ message: 'hesap silindi' });
    clearRefreshCookie(response);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
