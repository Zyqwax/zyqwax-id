import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAccessToken } from '@/lib/server/auth-service';
import { safeUser } from '@/lib/server/http';
import { errorResponse } from '@/lib/server/route-utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromAccessToken(request.headers.get('authorization'));
    return NextResponse.json({ user: safeUser(user) });
  } catch (error) { return errorResponse(error); }
}
