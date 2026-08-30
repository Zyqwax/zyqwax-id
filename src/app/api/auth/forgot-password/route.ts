import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email/verificationService';
import { normalizeEmail } from '@/lib/server/validation';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { prisma } from '@/lib/server/prisma';

export const runtime = 'nodejs';
const bodySchema = z.object({ email: z.string().trim().email().max(254) }).strict();
const genericMessage = 'Eğer bu email kayıtlıysa bir sıfırlama linki gönderildi';

// Email varlığını açığa çıkarmadan parola sıfırlama emaili başlatır.
export async function POST(request: NextRequest) {
  try {
    const limit = checkRateLimit(`forgot-password:${clientKey(request)}`, 3);
    if (!limit.allowed) return rateLimited(limit.retryAfter);
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: genericMessage });
    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(parsed.data.email) }, select: { id: true, email: true } });
    if (user) {
      try { await sendPasswordResetEmail(user.id, user.email); } catch (error) { console.error('Parola sıfırlama emaili gönderilemedi', error); }
    }
    return NextResponse.json({ message: genericMessage });
  } catch (error) { return errorResponse(error); }
}
