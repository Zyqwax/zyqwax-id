import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, requirePermission } from '@/lib/server/route-utils';
import { PERMISSION } from '@/lib/server/roles';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, PERMISSION.loginHistoryRead);
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('pageSize') || 25)));
    const [total, records] = await prisma.$transaction([
      prisma.loginHistory.count(),
      prisma.loginHistory.findMany({ select: { id: true, ipAddress: true, userAgent: true, success: true, createdAt: true, user: { select: { id: true, email: true, username: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return NextResponse.json({ records, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } });
  } catch (error) { return errorResponse(error); }
}
