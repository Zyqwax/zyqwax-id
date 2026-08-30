import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canChangeField } from '@/lib/rateLimit/profileFields';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { comparePassword } from '@/lib/server/password';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, profileRateLimited } from '@/lib/server/route-utils';
import { safeUser, SESSION_ERROR } from '@/lib/server/http';
import { sendVerificationEmail } from '@/lib/email/verificationService';

export const runtime = 'nodejs';
const emailSchema = z.string().trim().toLowerCase().email().max(254);

// E-posta adresini parola ve yedi günlük cooldown ile günceller.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const body = await request.json();
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    if (!(await comparePassword(currentPassword, user.passwordHash))) throw new ServiceError(401, SESSION_ERROR);
    const limit = canChangeField(user.emailChangedAt, 7 * 24 * 60 * 60 * 1000);
    if (!limit.allowed) return profileRateLimited(limit.nextAllowedAt);
    const parsed = emailSchema.safeParse(body?.email);
    if (!parsed.success) return errorResponse(parsed.error);
    try {
      const updated = await prisma.user.update({ where: { id: user.id }, data: { email: parsed.data, emailChangedAt: new Date(), emailVerified: false } });
      // Yeni adres doğrulanana kadar hesap emailVerified=false kalır; gönderim hatası profil güncellemesini geri almaz.
      try { await sendVerificationEmail(updated.id, updated.email); } catch (emailError) { console.error('Doğrulama emaili gönderilemedi', emailError); }
      return NextResponse.json({ user: safeUser(updated) });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'bu e-posta adresi alınmış' }, { status: 409 });
      throw error;
    }
  } catch (error) { return errorResponse(error); }
}
