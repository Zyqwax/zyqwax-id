import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { sortPairIds } from '@/lib/friends/helpers';
import { ok } from '@/lib/friends/http';

export const runtime = 'nodejs';
const idSchema = z.string().uuid();

// İki kullanıcı arasındaki sıralı Friendship kaydını silerek arkadaşlıktan çıkarır.
export async function DELETE(request: NextRequest, context: { params: Promise<{ friendId: string }> }) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const friendId = idSchema.parse((await context.params).friendId);
    if (friendId === user.id) throw new ServiceError(404, 'zaten arkadaş değilsiniz');
    const [userAId, userBId] = sortPairIds(user.id, friendId);
    const friendship = await prisma.friendship.findUnique({ where: { userAId_userBId: { userAId, userBId } } });
    if (!friendship) throw new ServiceError(404, 'zaten arkadaş değilsiniz');
    await prisma.friendship.delete({ where: { id: friendship.id } });
    return ok('arkadaşlıktan çıkarıldı');
  } catch (error) { return errorResponse(error); }
}
