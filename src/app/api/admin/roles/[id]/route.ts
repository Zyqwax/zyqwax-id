import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, requirePermission, requireSameOrigin } from '@/lib/server/route-utils';
import { PERMISSION } from '@/lib/server/roles';
import { ServiceError } from '@/lib/server/auth-service';

export const runtime = 'nodejs';
const schema = z.object({ displayName: z.string().trim().min(1).max(80), permissionIds: z.array(z.string().min(1)).max(100) }).strict();
const protectedRoles = new Set(['role_user', 'role_administrator']);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    await requirePermission(request, PERMISSION.rolesManage);
    const id = (await params).id;
    if (protectedRoles.has(id)) throw new ServiceError(400, 'sistem rolleri düzenlenemez');
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const ids = [...new Set(parsed.data.permissionIds)];
    const permissions = await prisma.permission.findMany({ where: { id: { in: ids } }, select: { id: true } });
    if (permissions.length !== ids.length) return NextResponse.json({ error: 'geçersiz izin seçimi' }, { status: 400 });
    const role = await prisma.$transaction(async (tx) => {
      await tx.userRole.update({ where: { id }, data: { displayName: parsed.data.displayName } });
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      if (ids.length) await tx.rolePermission.createMany({ data: ids.map(permissionId => ({ roleId: id, permissionId })) });
      return tx.userRole.findUniqueOrThrow({ where: { id }, select: { id: true, displayName: true, _count: { select: { users: true } }, permissions: { select: { permission: { select: { id: true, tag: true, displayName: true } } } } } });
    });
    return NextResponse.json({ role: { ...role, userCount: role._count.users, permissions: role.permissions.map(({ permission }) => permission) } });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    await requirePermission(request, PERMISSION.rolesManage);
    const id = (await params).id;
    if (protectedRoles.has(id)) throw new ServiceError(400, 'sistem rolleri silinemez');
    const role = await prisma.userRole.findUnique({ where: { id }, select: { _count: { select: { users: true } } } });
    if (!role) throw new ServiceError(404, 'rol bulunamadı');
    if (role._count.users) throw new ServiceError(409, 'kullanıcılara atanmış rol silinemez');
    await prisma.userRole.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return errorResponse(error); }
}
