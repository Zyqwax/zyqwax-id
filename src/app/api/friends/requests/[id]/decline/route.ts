import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse } from '@/lib/server/route-utils';
import { ok } from '@/lib/friends/http';

export const runtime = 'nodejs';
const idSchema = z.string().uuid();

// Alınan bekleyen isteği yalnızca alıcısının reddedebilmesini sağlar.
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const id = idSchema.parse((await context.params).id);
    const requestRow = await prisma.friendRequest.findUnique({ where: { id } });
    if (!requestRow || requestRow.receiverId !== user.id) throw new ServiceError(403, 'başkasının isteğini reddedemezsin');
    if (requestRow.status !== 'PENDING') throw new ServiceError(409, 'bu istek zaten yanıtlanmış');
    await prisma.friendRequest.update({ where: { id }, data: { status: 'DECLINED', respondedAt: new Date() } });
    return ok('arkadaşlık isteği reddedildi');
  } catch (error) { return errorResponse(error); }
}
