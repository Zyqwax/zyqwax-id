import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { publicFriend } from '@/lib/friends/http';

export const runtime = 'nodejs';
// Arkadaşlık kayıtlarını eski arkadaşlıklar önce gelecek şekilde listeler.
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const rows = await prisma.friendship.findMany({ where: { OR: [{ userAId: user.id }, { userBId: user.id }] }, include: { userA: { select: { id: true, username: true, name: true, avatarUrl: true } }, userB: { select: { id: true, username: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ friends: rows.map((row) => publicFriend(row.userAId === user.id ? row.userB : row.userA)) });
  } catch (error) { return errorResponse(error); }
}

