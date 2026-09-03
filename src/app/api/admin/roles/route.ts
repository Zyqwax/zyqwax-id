import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, requirePermission, requireSameOrigin } from '@/lib/server/route-utils';
import { PERMISSION } from '@/lib/server/roles';

export const runtime = 'nodejs';

const roleSchema = z.object({ displayName: z.string().trim().min(1).max(80), permissionIds: z.array(z.string().min(1)).max(100) }).strict();

const roleSelect = {
  id: true,
  displayName: true,
  _count: { select: { users: true } },
  permissions: { select: { permission: { select: { id: true, tag: true, displayName: true } } } },
} as const;

function serialize(role: Awaited<ReturnType<typeof prisma.userRole.findMany>>[number] & { _count: { users: number }; permissions: { permission: { id: string; tag: string; displayName: string } }[] }) {
  return { id: role.id, displayName: role.displayName, userCount: role._count.users, permissions: role.permissions.map(({ permission }) => permission) };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, PERMISSION.rolesManage);
    const [roles, permissions] = await Promise.all([
      prisma.userRole.findMany({ select: roleSelect, orderBy: { displayName: 'asc' } }),
      prisma.permission.findMany({ select: { id: true, tag: true, displayName: true }, orderBy: { tag: 'asc' } }),
    ]);
    return NextResponse.json({ roles: roles.map(serialize), permissions });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    await requirePermission(request, PERMISSION.rolesManage);
    const parsed = roleSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const permissions = await prisma.permission.findMany({ where: { id: { in: parsed.data.permissionIds } }, select: { id: true } });
    if (permissions.length !== new Set(parsed.data.permissionIds).size) return NextResponse.json({ error: 'geçersiz izin seçimi' }, { status: 400 });
    const role = await prisma.userRole.create({ data: { id: `role_${crypto.randomUUID()}`, displayName: parsed.data.displayName, permissions: { create: permissions.map(({ id }) => ({ permissionId: id })) } }, select: roleSelect });
    return NextResponse.json({ role: serialize(role) }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
