import { NextRequest, NextResponse } from 'next/server';
import { refreshUser } from '@/lib/server/auth-service';
import { setRefreshCookie, clearRefreshCookie } from '@/lib/server/cookies';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`refresh:${clientKey(request)}`, 5);
  if (!limit.allowed) return rateLimited(limit.retryAfter);
  try {
    const result = await refreshUser(request.cookies.get('refreshToken')?.value);
    const response = NextResponse.json({ accessToken: result.accessToken });
    setRefreshCookie(response, result.refreshToken);
    return response;
  } catch (error) {
    const response = errorResponse(error);
    if (response.status === 401) clearRefreshCookie(response);
    return response;
  }
}
