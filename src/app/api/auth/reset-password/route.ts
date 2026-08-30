import { VerificationTokenType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashToken } from '@/lib/email/verificationToken';
import { hashPassword } from '@/lib/server/password';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { passwordSchema } from '@/lib/server/validation';

export const runtime = 'nodejs';
const bodySchema = z.object({ token: z.string().min(1), newPassword: passwordSchema }).strict();

// Geçerli reset token'ı tüketerek parolayı değiştirir ve tüm oturumları iptal eder.
export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'geçersiz istek' }, { status: 400 });
    const record = await prisma.verificationToken.findFirst({ where: { tokenHash: hashToken(parsed.data.token), type: VerificationTokenType.PASSWORD_RESET, expiresAt: { gt: new Date() } } });
    if (!record) return NextResponse.json({ error: 'sıfırlama linki geçersiz veya süresi dolmuş' }, { status: 400 });
    // Parola değişince daha önce ele geçirilmiş veya açık tüm refresh oturumları geçersiz kılınır.
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } }),
      prisma.refreshToken.updateMany({ where: { userId: record.userId, revoked: false }, data: { revoked: true } }),
      prisma.verificationToken.delete({ where: { id: record.id } }),
    ]);
    return NextResponse.json({ message: 'parola başarıyla güncellendi' });
  } catch (error) { return errorResponse(error); }
}
