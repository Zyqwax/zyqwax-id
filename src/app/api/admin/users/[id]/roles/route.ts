import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, requirePermission, requireSameOrigin } from '@/lib/server/route-utils';
import { PERMISSION } from '@/lib/server/roles';
import { ServiceError } from '@/lib/server/auth-service';

export const runtime = 'nodejs';
const schema = z.object({ roleIds: z.array(z.string().min(1)).min(1).max(20) }).strict();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const actor = await requirePermission(request, PERMISSION.usersRolesUpdate);
    const userId = (await params).id;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const roleIds = [...new Set(parsed.data.roleIds)];
    const roles = await prisma.userRole.findMany({ where: { id: { in: roleIds } }, select: { id: true } });
    if (roles.length !== roleIds.length) throw new ServiceError(400, 'geçersiz rol seçimi');
    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!target) throw new ServiceError(404, 'kullanıcı bulunamadı');
      const grantsAdmin = await tx.rolePermission.count({ where: { roleId: { in: roleIds }, permission: { tag: PERMISSION.adminAccess } } });
      if (actor.id === userId && grantsAdmin === 0) throw new ServiceError(400, 'kendi admin yetkinizi kaldıramazsınız');
      if (grantsAdmin === 0) {
        const remaining = await tx.userRoleAssignment.count({ where: { role: { permissions: { some: { permission: { tag: PERMISSION.adminAccess } } } }, userId: { not: userId } } });
        if (remaining === 0) throw new ServiceError(400, 'sistemde en az bir administrator kalmalıdır');
      }
      await tx.userRoleAssignment.deleteMany({ where: { userId } });
      await tx.userRoleAssignment.createMany({ data: roleIds.map(roleId => ({ userId, roleId })) });
      return tx.userRoleAssignment.findMany({ where: { userId }, select: { roleId: true } });
    });
    return NextResponse.json({ roleIds: result.map(({ roleId }) => roleId) });
  } catch (error) { return errorResponse(error); }
}
