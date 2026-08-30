import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { sortPairIds } from '@/lib/friends/helpers';
import { ok } from '@/lib/friends/http';

export const runtime = 'nodejs';
const idSchema = z.string().uuid();

// Alınan isteği yetki kontrolüyle kabul eder ve arkadaşlığı atomik olarak oluşturur.
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const id = idSchema.parse((await context.params).id);
    const requestRow = await prisma.friendRequest.findUnique({ where: { id } });
    if (!requestRow || requestRow.receiverId !== user.id) throw new ServiceError(403, 'başkasının isteğini kabul edemezsin');
    if (requestRow.status !== 'PENDING') throw new ServiceError(409, 'bu istek zaten yanıtlanmış');
    const [userAId, userBId] = sortPairIds(requestRow.senderId, requestRow.receiverId);
    // Durum ve Friendship aynı transaction'da yazılır; hata olursa ikisi birlikte geri alınır.
    await prisma.$transaction(async (tx) => {
      await tx.friendRequest.update({ where: { id }, data: { status: 'ACCEPTED', respondedAt: new Date() } });
      await tx.friendship.create({ data: { userAId, userBId } });
    });
    return ok('arkadaşlık isteği kabul edildi');
  } catch (error) { return errorResponse(error); }
}
