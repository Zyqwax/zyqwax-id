import { NextRequest, NextResponse } from 'next/server';
import { developerAppSchema, createDeveloperApp, appSelect } from '@/lib/server/developer-apps';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { errorResponse, requireSameOrigin } from '@/lib/server/route-utils';
import { prisma } from '@/lib/server/prisma';
import { PERMISSION, requirePerm } from '@/lib/server/roles';

export const runtime = 'nodejs';

function requireMutationOrigin(request: NextRequest) {
  if (!request.headers.get('authorization')) requireSameOrigin(request);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    await requirePerm(user.id, PERMISSION.developerAppsRead);
    const apps = await prisma.app.findMany({ where: { ownerId: user.id }, select: appSelect, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ apps });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
  try {
    requireMutationOrigin(request);
    const user = await getAuthenticatedUserFromRequest(request);
    await requirePerm(user.id, PERMISSION.developerAppsCreate);
    const parsed = developerAppSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    return NextResponse.json(await createDeveloperApp(user.id, parsed.data), { status: 201 });
  } catch (error) { return errorResponse(error); }
}
