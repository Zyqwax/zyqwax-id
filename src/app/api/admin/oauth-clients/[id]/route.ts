import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, requirePermission, requireSameOrigin } from '@/lib/server/route-utils';
import { PERMISSION } from '@/lib/server/roles';

export const runtime = 'nodejs';

const updateSchema = z.object({ name: z.string().trim().min(1).max(120), redirectUris: z.array(z.string().url().max(2048)).min(1).max(20), allowedOrigins: z.array(z.string().url().max(512)).max(20) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    await requirePermission(request, PERMISSION.oauthClientsUpdate);
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(parsed.error);
    const client = await prisma.app.update({ where: { id: (await params).id }, data: parsed.data, select: { id: true, clientId: true, name: true, redirectUris: true, allowedOrigins: true, createdAt: true } });
    return NextResponse.json({ client });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    await requirePermission(request, PERMISSION.oauthClientsDelete);
    await prisma.app.delete({ where: { id: (await params).id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return errorResponse(error); }
}
