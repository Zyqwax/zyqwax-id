import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/server/validation';
import { registerUser } from '@/lib/server/auth-service';
import { setRefreshCookie } from '@/lib/server/cookies';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { sendVerificationEmail } from '@/lib/email/verificationService';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`auth:${clientKey(request)}`, 50);
  if (!limit.allowed) return rateLimited(limit.retryAfter);
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const result = await registerUser(parsed.data);
    // Email sağlayıcısı geçici olarak çalışmasa bile kayıt başarılı kalmalıdır; gönderim hatası yalnızca loglanır.
    try { await sendVerificationEmail(result.user.id, parsed.data.email); } catch (emailError) { console.error('Doğrulama emaili gönderilemedi', emailError); }
    const response = NextResponse.json({ user: result.user, accessToken: result.accessToken }, { status: 201 });
    setRefreshCookie(response, result.refreshToken);
    return response;
  } catch (error) { return errorResponse(error); }
}
