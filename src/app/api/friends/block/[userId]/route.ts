import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { ok } from '@/lib/friends/http';

export const runtime = 'nodejs';
const idSchema = z.string().uuid();

// Kişinin kendi koyduğu engeli kaldırır; engel kalkınca arkadaşlık otomatik kurulmaz.
export async function DELETE(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const userId = idSchema.parse((await context.params).userId);
    const block = await prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: userId } } });
    if (!block) throw new ServiceError(404, 'engel bulunamadı');
    await prisma.block.delete({ where: { id: block.id } });
    return ok('engel kaldırıldı');
  } catch (error) { return errorResponse(error); }
}
