import { NextRequest, NextResponse } from 'next/server';
import { revokeRefreshToken } from '@/lib/server/auth-service';
import { clearRefreshCookie } from '@/lib/server/cookies';
import { errorResponse } from '@/lib/server/route-utils';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await revokeRefreshToken(request.cookies.get('refreshToken')?.value);
    const response = NextResponse.json({ message: 'çıkış yapıldı' });
    clearRefreshCookie(response);
    return response;
  } catch (error) { return errorResponse(error); }
}
