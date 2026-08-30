import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/server/validation';
import { loginUser } from '@/lib/server/auth-service';
import { setRefreshCookie } from '@/lib/server/cookies';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const key = clientKey(request);
  const general = checkRateLimit(`auth:${key}`, 50);
  const sensitive = checkRateLimit(`login:${key}`, 5);
  if (!general.allowed || !sensitive.allowed) return rateLimited(Math.max(general.retryAfter, sensitive.retryAfter));
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const result = await loginUser(parsed.data, { ip: key, userAgent: request.headers.get('user-agent') || 'unknown' });
    const response = NextResponse.json({ user: result.user, accessToken: result.accessToken });
    setRefreshCookie(response, result.refreshToken);
    return response;
  } catch (error) { return errorResponse(error); }
}
