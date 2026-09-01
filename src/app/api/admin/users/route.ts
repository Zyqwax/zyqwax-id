import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, requirePermission } from '@/lib/server/route-utils';
import { PERMISSION } from '@/lib/server/roles';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, PERMISSION.usersRead);
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('pageSize') || 25)));
    const query = request.nextUrl.searchParams.get('q')?.trim();
    const where = query ? { OR: [{ email: { contains: query, mode: 'insensitive' as const } }, { username: { contains: query, mode: 'insensitive' as const } }, { name: { contains: query, mode: 'insensitive' as const } }] } : {};
    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, select: { id: true, email: true, username: true, name: true, isActive: true, emailVerified: true, createdAt: true, roles: { select: { roleId: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return NextResponse.json({ users: users.map(user => ({ ...user, roles: user.roles.map(role => role.roleId) })), pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } });
  } catch (error) { return errorResponse(error); }
}
