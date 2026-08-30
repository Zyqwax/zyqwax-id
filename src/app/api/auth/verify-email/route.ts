import { VerificationTokenType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { hashToken } from '@/lib/email/verificationToken';
import { prisma } from '@/lib/server/prisma';
import { badRequest, errorResponse } from '@/lib/server/route-utils';

export const runtime = 'nodejs';

// Email doğrulama token'ını tek kullanımlık olarak tüketir.
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) return badRequest('doğrulama tokenı gerekli');
    const record = await prisma.verificationToken.findFirst({ where: { tokenHash: hashToken(token), type: VerificationTokenType.EMAIL_VERIFY, expiresAt: { gt: new Date() } } });
    if (!record) return badRequest('doğrulama linki geçersiz veya süresi dolmuş');
    // Token yarışlarında iki istekten yalnızca biri kaydı silebilir; deleteMany 500 yerine kontrollü sonuç sağlar.
    const consumed = await prisma.$transaction(async (tx) => {
      const deleted = await tx.verificationToken.deleteMany({ where: { id: record.id } });
      if (deleted.count !== 1) return false;
      await tx.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
      return true;
    });
    if (!consumed) return badRequest('doğrulama linki geçersiz veya daha önce kullanılmış');
    return NextResponse.json({ message: 'email adresi doğrulandı' });
  } catch (error) { return errorResponse(error); }
}
