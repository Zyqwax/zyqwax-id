import { NextRequest, NextResponse } from 'next/server';
import { rotateDeveloperSecret } from '@/lib/server/developer-apps';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { errorResponse, requireSameOrigin } from '@/lib/server/route-utils';
import { PERMISSION, requirePerm } from '@/lib/server/roles';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!request.headers.get('authorization')) requireSameOrigin(request);
    const user = await getAuthenticatedUserFromRequest(request);
    await requirePerm(user.id, PERMISSION.developerAppsUpdate);
    const clientSecret = await rotateDeveloperSecret(user.id, (await params).id);
    return NextResponse.json({ clientSecret });
  } catch (error) { return errorResponse(error); }
}
