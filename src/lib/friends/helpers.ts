import { prisma } from '@/lib/server/prisma';

// Friendship kayıtlarında UUID çiftinin her zaman aynı sırada tutulmasını sağlar.
export function sortPairIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

// Engellemenin yönünü açığa çıkarmadan iki kullanıcı arasında blok olup olmadığını kontrol eder.
export async function areBlocked(userId1: string, userId2: string): Promise<boolean> {
  return Boolean(await prisma.block.findFirst({ where: { OR: [{ blockerId: userId1, blockedId: userId2 }, { blockerId: userId2, blockedId: userId1 }] }, select: { id: true } }));
}

// Sıralı kullanıcı çiftiyle mevcut arkadaşlığı arar.
export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  const [userAId, userBId] = sortPairIds(userId1, userId2);
  return Boolean(await prisma.friendship.findUnique({ where: { userAId_userBId: { userAId, userBId } }, select: { id: true } }));
}

// Her iki yöndeki bekleyen isteği tek sorguda bulur.
export async function getPendingRequestBetween(userId1: string, userId2: string) {
  return prisma.friendRequest.findFirst({ where: { status: 'PENDING', OR: [{ senderId: userId1, receiverId: userId2 }, { senderId: userId2, receiverId: userId1 }] } });
}
