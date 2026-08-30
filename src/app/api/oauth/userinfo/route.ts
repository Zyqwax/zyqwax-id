import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/server/oauth-service';
import { errorResponse } from '@/lib/server/route-utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try { return NextResponse.json(await getUserInfo(request)); }
  catch (error) { return errorResponse(error); }
}
