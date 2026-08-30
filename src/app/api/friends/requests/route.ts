import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { usernameSchema } from '@/lib/validation/username';
import { areBlocked, areFriends, getPendingRequestBetween, sortPairIds } from '@/lib/friends/helpers';
import { publicFriend } from '@/lib/friends/http';

export const runtime = 'nodejs';
const requestBodySchema = z.object({ receiverUsername: usernameSchema });
const typeSchema = z.enum(['sent', 'received']).default('received');

// Kullanıcı adına göre arkadaşlık isteği gönderir veya karşılıklı isteği otomatik eşleştirir.
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const parsed = requestBodySchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const receiver = await prisma.user.findUnique({ where: { username: parsed.data.receiverUsername }, select: { id: true } });
    if (!receiver) throw new ServiceError(404, 'kullanıcı bulunamadı');
    if (receiver.id === user.id) throw new ServiceError(400, 'kendine istek gönderemezsin');
    if (await areBlocked(user.id, receiver.id)) {
      // Engel yönünü açıklamamak user enumeration ve gizlilik sızıntısını önler.
      throw new ServiceError(403, 'bu kullanıcıya istek gönderilemiyor');
    }
    if (await areFriends(user.id, receiver.id)) throw new ServiceError(409, 'zaten arkadaşsınız');
    const pending = await getPendingRequestBetween(user.id, receiver.id);
    if (pending) {
      if (pending.senderId === user.id) throw new ServiceError(409, 'zaten bekleyen bir isteğin var');
      const [userAId, userBId] = sortPairIds(user.id, receiver.id);
      // İstek ve arkadaşlık aynı transaction'da değişir; biri başarısızsa ikisi de geri alınır.
      await prisma.$transaction(async (tx) => {
        await tx.friendRequest.update({ where: { id: pending.id }, data: { status: 'ACCEPTED', respondedAt: new Date() } });
        await tx.friendship.create({ data: { userAId, userBId } });
      });
      return NextResponse.json({ message: 'otomatik eşleşti' });
    }
    const created = await prisma.friendRequest.create({ data: { senderId: user.id, receiverId: receiver.id } });
    return NextResponse.json({ id: created.id, status: created.status }, { status: 201 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'bu istek zaten mevcut' }, { status: 409 });
    return errorResponse(error);
  }
}

// Kullanıcının bekleyen gönderilmiş veya alınmış arkadaşlık isteklerini listeler.
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const type = typeSchema.parse(request.nextUrl.searchParams.get('type') ?? 'received');
    const rows = await prisma.friendRequest.findMany({
      where: type === 'sent' ? { senderId: user.id, status: 'PENDING' } : { receiverId: user.id, status: 'PENDING' },
      include: { sender: { select: { id: true, username: true, name: true, avatarUrl: true } }, receiver: { select: { id: true, username: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ requests: rows.map((row) => ({ id: row.id, status: row.status, createdAt: row.createdAt, user: publicFriend(type === 'sent' ? row.receiver : row.sender) })) });
  } catch (error) { return errorResponse(error); }
}
