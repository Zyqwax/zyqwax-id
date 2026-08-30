import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email/verificationService';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

// Giriş yapmış ve doğrulanmamış kullanıcıya yeni doğrulama emaili gönderir.
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (user.emailVerified) return NextResponse.json({ error: 'email adresi zaten doğrulanmış' }, { status: 400 });
    const limit = checkRateLimit(`verification:${user.id}`, 1, 5 * 60 * 1000);
    if (!limit.allowed) return rateLimited(limit.retryAfter);
    try { await sendVerificationEmail(user.id, user.email); } catch (error) { console.error('Doğrulama emaili gönderilemedi', error); return NextResponse.json({ error: 'email gönderilemedi' }, { status: 503 }); }
    return NextResponse.json({ message: 'doğrulama emaili gönderildi' });
  } catch (error) { return errorResponse(error); }
}
