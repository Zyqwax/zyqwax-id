import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';

export const runtime = 'nodejs';

// Yalnızca kullanıcının engellediklerini döndürür; karşılıklı gizlilik için beni engelleyenler listelenmez.
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const rows = await prisma.block.findMany({ where: { blockerId: user.id }, include: { blocked: { select: { id: true, username: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ blocked: rows.map((row) => ({ id: row.id, createdAt: row.createdAt, user: row.blocked })) });
  } catch (error) { return errorResponse(error); }
}
