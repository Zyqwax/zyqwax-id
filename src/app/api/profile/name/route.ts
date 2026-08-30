import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canChangeField } from '@/lib/rateLimit/profileFields';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, profileRateLimited } from '@/lib/server/route-utils';
import { safeUser } from '@/lib/server/http';

export const runtime = 'nodejs';
const nameSchema = z.string().trim().min(1).max(50);

// Kullanıcı görünen adını parola istemeden, 24 saatlik cooldown ile günceller.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const limit = canChangeField(user.nameChangedAt, 24 * 60 * 60 * 1000);
    if (!limit.allowed) return profileRateLimited(limit.nextAllowedAt);
    const body = await request.json();
    const parsed = nameSchema.safeParse(body?.name);
    if (!parsed.success) return errorResponse(parsed.error);
    const updated = await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data, nameChangedAt: new Date() } });
    return NextResponse.json({ user: safeUser(updated) });
  } catch (error) { return errorResponse(error); }
}
