import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { sortPairIds } from '@/lib/friends/helpers';
import { ok } from '@/lib/friends/http';

export const runtime = 'nodejs';
const bodySchema = z.object({ userId: z.string().uuid() });

// Kullanıcıyı engeller; mevcut arkadaşlık ve bekleyen istekleri atomik biçimde kaldırır.
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const { userId } = parsed.data;
    if (userId === user.id) throw new ServiceError(400, 'kendini engelleyemezsin');
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!target) throw new ServiceError(404, 'kullanıcı bulunamadı');
    const existing = await prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: userId } } });
    if (existing) throw new ServiceError(409, 'kullanıcı zaten engelli');
    const [userAId, userBId] = sortPairIds(user.id, userId);
    // İlişkilerin temizlenmesi ve Block oluşturulması aynı transaction'da atomik yapılır.
    await prisma.$transaction(async (tx) => {
      await tx.friendship.deleteMany({ where: { userAId, userBId } });
      await tx.friendRequest.updateMany({ where: { status: 'PENDING', OR: [{ senderId: user.id, receiverId: userId }, { senderId: userId, receiverId: user.id }] }, data: { status: 'DECLINED', respondedAt: new Date() } });
      await tx.block.create({ data: { blockerId: user.id, blockedId: userId } });
    });
    return ok('kullanıcı engellendi');
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'kullanıcı zaten engelli' }, { status: 409 });
    return errorResponse(error);
  }
}

