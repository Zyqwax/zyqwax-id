import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/server/validation';
import { registerUser } from '@/lib/server/auth-service';
import { setRefreshCookie } from '@/lib/server/cookies';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`auth:${clientKey(request)}`, 50);
  if (!limit.allowed) return rateLimited(limit.retryAfter);
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const result = await registerUser(parsed.data);
    const response = NextResponse.json({ user: result.user, accessToken: result.accessToken }, { status: 201 });
    setRefreshCookie(response, result.refreshToken);
    return response;
  } catch (error) { return errorResponse(error); }
}
