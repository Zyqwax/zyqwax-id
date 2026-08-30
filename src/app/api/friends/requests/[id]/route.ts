import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { ok } from '@/lib/friends/http';

export const runtime = 'nodejs';
const idSchema = z.string().uuid();

// Gönderilmiş bekleyen isteği iptal etmek için kaydı tamamen siler; geçmiş yanıtlar korunur.
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const id = idSchema.parse((await context.params).id);
    const requestRow = await prisma.friendRequest.findUnique({ where: { id } });
    if (!requestRow || requestRow.senderId !== user.id) throw new ServiceError(403, 'başkasının gönderdiği isteği iptal edemezsin');
    if (requestRow.status !== 'PENDING') throw new ServiceError(409, 'bu istek zaten yanıtlanmış');
    await prisma.friendRequest.delete({ where: { id } });
    return ok('arkadaşlık isteği iptal edildi');
  } catch (error) { return errorResponse(error); }
}
