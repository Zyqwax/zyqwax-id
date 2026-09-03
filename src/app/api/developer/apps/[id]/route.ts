import { NextRequest, NextResponse } from 'next/server';
import { appSelect, developerAppUpdateSchema, getOwnedDeveloperApp } from '@/lib/server/developer-apps';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { errorResponse, requireSameOrigin } from '@/lib/server/route-utils';
import { prisma } from '@/lib/server/prisma';
import { PERMISSION, requirePerm } from '@/lib/server/roles';

export const runtime = 'nodejs';

function requireMutationOrigin(request: NextRequest) {
  if (!request.headers.get('authorization')) requireSameOrigin(request);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    await requirePerm(user.id, PERMISSION.developerAppsRead);
    return NextResponse.json({ app: await getOwnedDeveloperApp(user.id, (await params).id) });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireMutationOrigin(request);
    const user = await getAuthenticatedUserFromRequest(request);
    await requirePerm(user.id, PERMISSION.developerAppsUpdate);
    const id = (await params).id;
    await getOwnedDeveloperApp(user.id, id);
    const parsed = developerAppUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const app = await prisma.app.update({ where: { id, ownerId: user.id }, data: parsed.data, select: appSelect });
    return NextResponse.json({ app });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireMutationOrigin(request);
    const user = await getAuthenticatedUserFromRequest(request);
    await requirePerm(user.id, PERMISSION.developerAppsDelete);
    const id = (await params).id;
    await getOwnedDeveloperApp(user.id, id);
    await prisma.$transaction([
      prisma.app.update({ where: { id, ownerId: user.id }, data: { isActive: false } }),
      prisma.refreshToken.updateMany({ where: { appId: id, revoked: false }, data: { revoked: true } }),
    ]);
    return new NextResponse(null, { status: 204 });
  } catch (error) { return errorResponse(error); }
}
