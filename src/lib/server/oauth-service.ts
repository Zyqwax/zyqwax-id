import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';
import { comparePassword } from './password';
import { createCodeChallenge, generateAuthorizationCode, generateConsentToken, hashAuthorizationCode, hashConsentToken, safeCompare } from './oauth-code';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from './jwt';
import { getAuthenticatedUserFromRequest, getUserWithAccessToken, ServiceError } from './auth-service';
import { OAUTH_ERROR } from './http';
import { normalizeScope } from './validation';
import { getServerEnv } from './env';
import { publicFriend } from '@/lib/friends/http';

type AuthorizeInput = { client_id: string; redirect_uri: string; response_type: 'code'; scope: string; state?: string; code_challenge: string; code_challenge_method: 'S256' };
type TokenInput = { grant_type: 'authorization_code'; code: string; redirect_uri: string; client_id: string; client_secret: string; code_verifier: string };
const CODE_LIFETIME_MS = 2 * 60 * 1000;
const CONSENT_LIFETIME_MS = 10 * 60 * 1000;

export async function authorizeUser(request: NextRequest, query: AuthorizeInput): Promise<NextResponse> {
  const app = await prisma.app.findUnique({ where: { clientId: query.client_id } });
  if (!app || !app.redirectUris.includes(query.redirect_uri)) throw new ServiceError(400, OAUTH_ERROR);
  const scope = normalizeScope(query.scope);
  if (!scope) throw new ServiceError(400, 'desteklenmeyen scope');

  let user;
  // Önce bearer header, yoksa root kapsamlı refresh cookie ile kullanıcı bulunur.
  try { user = await getAuthenticatedUserFromRequest(request); }
  catch (error) {
    if (!(error instanceof ServiceError) || error.status !== 401) throw error;
    const loginUrl = new URL(getServerEnv().OAUTH_LOGIN_URL ?? '/login', request.url);
    const original = new URL(request.url);
    loginUrl.searchParams.set('redirect', `${original.pathname}${original.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const rawConsentToken = generateConsentToken();
  await prisma.oAuthConsentRequest.create({ data: { tokenHash: hashConsentToken(rawConsentToken), userId: user.id, appId: app.id, redirectUri: query.redirect_uri, scope, state: query.state, codeChallenge: query.code_challenge, codeChallengeMethod: query.code_challenge_method, expiresAt: new Date(Date.now() + CONSENT_LIFETIME_MS) } });
  const consentUrl = new URL('/oauth/authorize/consent', request.url);
  consentUrl.searchParams.set('request', rawConsentToken);
  return NextResponse.redirect(consentUrl);
}

export async function getConsentRequest(rawToken: string) {
  const consent = await prisma.oAuthConsentRequest.findFirst({
    where: { tokenHash: hashConsentToken(rawToken), used: false, expiresAt: { gt: new Date() } },
    include: { app: true, user: { select: { email: true, username: true } } },
  });
  if (!consent) throw new ServiceError(400, 'onay isteği geçersiz veya süresi dolmuş');
  return consent;
}

export const OAUTH_SCOPE_LABELS: Record<string, string> = {
  profile: 'Profil bilgilerin (kullanıcı adı, ad ve avatar)',
  email: 'E-posta adresin',
  friends: 'Arkadaş listen',
  blocks: 'Engellediğin kullanıcılar',
};

export async function resolveConsent(rawToken: string, action: 'approve' | 'deny') {
  const consent = await getConsentRequest(rawToken);
  let redirect: URL;
  try { redirect = new URL(consent.redirectUri); }
  catch { throw new ServiceError(400, OAUTH_ERROR); }

  if (action === 'approve') {
    const rawCode = generateAuthorizationCode();
    await prisma.$transaction(async (tx) => {
      const consumed = await tx.oAuthConsentRequest.updateMany({ where: { id: consent.id, used: false, expiresAt: { gt: new Date() } }, data: { used: true } });
      if (consumed.count !== 1) throw new ServiceError(400, 'onay isteği geçersiz veya süresi dolmuş');
      await tx.authorizationCode.create({ data: { codeHash: hashAuthorizationCode(rawCode), userId: consent.userId, appId: consent.appId, redirectUri: consent.redirectUri, scope: consent.scope, codeChallenge: consent.codeChallenge, codeChallengeMethod: consent.codeChallengeMethod, expiresAt: new Date(Date.now() + CODE_LIFETIME_MS) } });
    });
    redirect.searchParams.set('code', rawCode);
  } else {
    const consumed = await prisma.oAuthConsentRequest.updateMany({ where: { id: consent.id, used: false, expiresAt: { gt: new Date() } }, data: { used: true } });
    if (consumed.count !== 1) throw new ServiceError(400, 'onay isteği geçersiz veya süresi dolmuş');
    redirect.searchParams.set('error', 'access_denied');
    redirect.searchParams.set('error_description', 'kullanıcı yetkilendirmeyi iptal etti');
  }
  if (consent.state) redirect.searchParams.set('state', consent.state);
  // Consent formu POST olduğu için 303 kullanılır; callback'e POST taşınmamalı.
  return NextResponse.redirect(redirect, { status: 303 });
}

export async function exchangeAuthorizationCode(body: TokenInput) {
  const app = await prisma.app.findUnique({ where: { clientId: body.client_id } });
  if (!app || !(await comparePassword(body.client_secret, app.secretKeyHash))) throw new ServiceError(401, 'client doğrulanamadı');
  const code = await prisma.authorizationCode.findFirst({ where: { codeHash: hashAuthorizationCode(body.code), appId: app.id, redirectUri: body.redirect_uri, used: false, expiresAt: { gt: new Date() } }, include: { user: true } });
  if (!code || !code.user.isActive || code.codeChallengeMethod !== 'S256') throw new ServiceError(400, 'authorization code geçersiz');
  if (!safeCompare(createCodeChallenge(body.code_verifier), code.codeChallenge)) throw new ServiceError(400, 'PKCE doğrulaması başarısız');
  const accessToken = generateAccessToken(code.userId, code.scope ?? 'profile email');
  const refreshToken = generateRefreshToken(code.userId);
  await prisma.$transaction(async (tx) => {
    const consumed = await tx.authorizationCode.updateMany({ where: { id: code.id, used: false, expiresAt: { gt: new Date() } }, data: { used: true } });
    if (consumed.count !== 1) throw new ServiceError(400, 'authorization code geçersiz');
    await tx.refreshToken.create({ data: { tokenHash: hashRefreshToken(refreshToken), userId: code.userId, appId: app.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  });
  return { access_token: accessToken, refresh_token: refreshToken, token_type: 'Bearer', expires_in: 900 };
}

export async function getUserInfo(request: NextRequest) {
  const { user, payload } = await getUserWithAccessToken(request.headers.get('authorization'));
  if (typeof payload.scope !== 'string') throw new ServiceError(403, 'oauth scope gerekli');
  const grantedScope = normalizeScope(payload.scope);
  if (!grantedScope) throw new ServiceError(403, 'geçersiz oauth scope');
  const scopes = new Set(grantedScope.split(' '));
  const result: { sub: string; [key: string]: unknown } = { sub: user.id };

  if (scopes.has('profile')) Object.assign(result, { username: user.username, name: user.name, avatarUrl: user.avatarUrl });
  if (scopes.has('email')) result.email = user.email;
  if (scopes.has('friends')) {
    const rows = await prisma.friendship.findMany({ where: { OR: [{ userAId: user.id }, { userBId: user.id }] }, include: { userA: { select: { id: true, username: true, name: true, avatarUrl: true } }, userB: { select: { id: true, username: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } });
    result.friends = rows.map((row) => publicFriend(row.userAId === user.id ? row.userB : row.userA));
  }
  if (scopes.has('blocks')) {
    const rows = await prisma.block.findMany({ where: { blockerId: user.id }, include: { blocked: { select: { id: true, username: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' } });
    result.blocks = rows.map((row) => publicFriend(row.blocked));
  }
  return result;
}
