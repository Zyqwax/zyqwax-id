import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';
import { canChangeField } from '@/lib/rateLimit/profileFields';
import { usernameSchema } from '@/lib/validation/username';
import { getAuthenticatedUserFromRequest, ServiceError } from '@/lib/server/auth-service';
import { comparePassword } from '@/lib/server/password';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, profileRateLimited } from '@/lib/server/route-utils';
import { safeUser, SESSION_ERROR } from '@/lib/server/http';
import { canBypassProfileLimits } from '@/lib/server/roles';

export const runtime = 'nodejs';

// Kullanıcı adını parola ve yedi günlük cooldown ile güvenli biçimde günceller.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const body = await request.json();
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    if (!(await comparePassword(currentPassword, user.passwordHash))) throw new ServiceError(401, SESSION_ERROR);
    if (!(await canBypassProfileLimits(user.id))) {
      const limit = canChangeField(user.usernameChangedAt, 7 * 24 * 60 * 60 * 1000);
      if (!limit.allowed) return profileRateLimited(limit.nextAllowedAt);
    }
    const parsed = usernameSchema.safeParse(body?.username);
    if (!parsed.success) return errorResponse(parsed.error);
    try {
      const updated = await prisma.user.update({ where: { id: user.id }, data: { username: parsed.data, usernameChangedAt: new Date() } });
      return NextResponse.json({ user: safeUser(updated) });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'bu kullanıcı adı alınmış' }, { status: 409 });
      throw error;
    }
  } catch (error) { return errorResponse(error); }
}
