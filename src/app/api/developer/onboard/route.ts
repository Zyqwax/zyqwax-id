import { NextRequest, NextResponse } from 'next/server';
import { getUserWithAccessToken, ServiceError } from '@/lib/server/auth-service';
import { ensureDeveloperRole } from '@/lib/server/developer-apps';
import { getServerEnv } from '@/lib/server/env';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { user, payload } = await getUserWithAccessToken(request.headers.get('authorization'));
    const portalClientId = getServerEnv().DEVELOPER_PORTAL_CLIENT_ID;
    if (!portalClientId || typeof payload.appId !== 'string') throw new ServiceError(403, 'developer portal client doğrulanamadı');
    const portal = await prisma.app.findUnique({ where: { clientId: portalClientId }, select: { id: true, isActive: true } });
    if (!portal || !portal.isActive || payload.appId !== portal.id) throw new ServiceError(403, 'developer portal client doğrulanamadı');
    await ensureDeveloperRole(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
