import { NextRequest, NextResponse } from 'next/server';
import { refreshUser, ServiceError } from '@/lib/server/auth-service';
import { SESSION_ERROR } from '@/lib/server/http';
import { setRefreshCookie } from '@/lib/server/cookies';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rawToken = request.cookies.get('refreshToken')?.value;
  if (!rawToken) return errorResponse(new ServiceError(401, SESSION_ERROR));
  // Refresh is called on every full page load; allow normal reloads without
  // making a missing-cookie request consume the bucket above.
  const limit = checkRateLimit(`refresh:${clientKey(request)}`, 30);
  if (!limit.allowed) return rateLimited(limit.retryAfter);
  try {
    const result = await refreshUser(rawToken);
    const response = NextResponse.json({ accessToken: result.accessToken });
    setRefreshCookie(response, result.refreshToken);
    return response;
  } catch (error) {
    // Do not expire the cookie on a failed rotation. A concurrent tab may
    // have already rotated the same token and set a newer cookie.
    return errorResponse(error);
  }
}
