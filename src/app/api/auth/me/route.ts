import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { safeUser } from '@/lib/server/http';
import { errorResponse } from '@/lib/server/route-utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Sayfa yenilenince bearer header yoksa session cookie'sinden devam edilir.
    const user = await getAuthenticatedUserFromRequest(request);
    return NextResponse.json({ user: safeUser(user) });
  } catch (error) { return errorResponse(error); }
}
