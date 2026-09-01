import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from './prisma';
import { comparePassword, hashPassword } from './password';
import { generateAccessToken, generateRefreshToken, hashRefreshToken, verifyAccessToken } from './jwt';
import { AUTH_ERROR, bearerToken, safeUser, SESSION_ERROR } from './http';
import { normalizeEmail } from './validation';
import { ROLE_ID, userAccessInclude } from './roles';

export class ServiceError extends Error {
  constructor(public readonly status: number, message: string) { super(message); this.name = 'ServiceError'; }
}

type RequestMeta = { ip: string; userAgent: string };
type Credentials = { identifier: string; password: string };
type Registration = { email: string; username: string; password: string };

async function saveRefreshToken(userId: string, rawToken: string, appId: string | null = null): Promise<void> {
  await prisma.refreshToken.create({ data: { tokenHash: hashRefreshToken(rawToken), userId, appId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
}

async function recordLogin(userId: string, meta: RequestMeta, success: boolean): Promise<void> {
  try { await prisma.loginHistory.create({ data: { userId, ipAddress: meta.ip, userAgent: meta.userAgent, success } }); } catch { /* Audit failure must not expose or break auth. */ }
}

export async function registerUser(body: Registration): Promise<{ user: ReturnType<typeof safeUser>; accessToken: string; refreshToken: string }> {
  try {
    const email = normalizeEmail(body.email);
    const existingEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingEmail) throw new ServiceError(409, 'bu e-posta adresi zaten kayıtlı');
    const existingUsername = await prisma.user.findUnique({ where: { username: body.username }, select: { id: true } });
    if (existingUsername) throw new ServiceError(409, 'bu kullanıcı adı alınmış');
    const user = await prisma.user.create({
      data: { email, username: body.username, passwordHash: await hashPassword(body.password), roles: { create: { roleId: ROLE_ID.defaultUser } } },
      include: userAccessInclude,
    });
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshToken);
    return { user: safeUser(user), accessToken, refreshToken };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') throw new ServiceError(400, 'kayıt işlemi tamamlanamadı');
    throw error;
  }
}

export async function loginUser(body: Credentials, meta: RequestMeta): Promise<{ user: ReturnType<typeof safeUser>; accessToken: string; refreshToken: string }> {
  // Tek bir alanla hem e-posta hem username üzerinden kullanıcı bulunur.
  const identifier = body.identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({ where: { OR: [{ email: normalizeEmail(identifier) }, { username: identifier }] }, include: userAccessInclude });
  const valid = user ? await comparePassword(body.password, user.passwordHash) : false;
  if (!user || !valid || !user.isActive) {
    if (user) await recordLogin(user.id, meta, false);
    throw new ServiceError(401, AUTH_ERROR);
  }
  await recordLogin(user.id, meta, true);
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await saveRefreshToken(user.id, refreshToken);
  return { user: safeUser(user), accessToken, refreshToken };
}

export async function refreshUser(rawToken: string | undefined): Promise<{ accessToken: string; refreshToken: string }> {
  if (!rawToken) throw new ServiceError(401, SESSION_ERROR);
  const current = await prisma.refreshToken.findFirst({ where: { tokenHash: hashRefreshToken(rawToken), revoked: false, expiresAt: { gt: new Date() } }, include: { user: { include: userAccessInclude } } });
  if (!current || !current.user.isActive) throw new ServiceError(401, SESSION_ERROR);
  const newRefreshToken = generateRefreshToken(current.userId);
  await prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshToken.updateMany({ where: { id: current.id, revoked: false }, data: { revoked: true } });
    if (revoked.count !== 1) throw new ServiceError(401, SESSION_ERROR);
    await tx.refreshToken.create({ data: { tokenHash: hashRefreshToken(newRefreshToken), userId: current.userId, appId: current.appId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  });
  return { accessToken: generateAccessToken(current.userId), refreshToken: newRefreshToken };
}

export async function revokeRefreshToken(rawToken: string | undefined): Promise<void> {
  if (rawToken) await prisma.refreshToken.updateMany({ where: { tokenHash: hashRefreshToken(rawToken), revoked: false }, data: { revoked: true } });
}

export async function getUserWithAccessToken(header: string | null) {
  const token = bearerToken(header);
  if (!token) throw new ServiceError(401, SESSION_ERROR);
  try {
    const payload = verifyAccessToken(token);
    if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('invalid subject');
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: userAccessInclude });
    if (!user || !user.isActive) throw new Error('inactive user');
    return { user, payload };
  } catch { throw new ServiceError(401, SESSION_ERROR); }
}

export async function getUserFromAccessToken(header: string | null) {
  return (await getUserWithAccessToken(header)).user;
}

// Tarayıcı yönlendirmelerinde header gelmediği için geçerli refresh cookie'si de kimlik kanıtıdır.
export async function getUserFromRefreshToken(rawToken: string | undefined) {
  if (!rawToken) throw new ServiceError(401, SESSION_ERROR);
  const current = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashRefreshToken(rawToken), revoked: false, expiresAt: { gt: new Date() } },
    include: { user: { include: userAccessInclude } },
  });
  if (!current || !current.user.isActive) throw new ServiceError(401, SESSION_ERROR);
  return current.user;
}

// Normal bearer auth'ı korur; header yoksa route'lara ortak cookie doğrulaması uygular.
export async function getAuthenticatedUserFromRequest(request: import('next/server').NextRequest) {
  const authorization = request.headers.get('authorization');
  if (authorization) return getUserFromAccessToken(authorization);
  return getUserFromRefreshToken(request.cookies.get('refreshToken')?.value);
}
