import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';
import { comparePassword } from './password';
import { createCodeChallenge, generateAuthorizationCode, hashAuthorizationCode, safeCompare } from './oauth-code';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from './jwt';
import { getAuthenticatedUserFromRequest, ServiceError } from './auth-service';
import { OAUTH_ERROR } from './http';
import { normalizeScope } from './validation';
import { getServerEnv } from './env';

type AuthorizeInput = { client_id: string; redirect_uri: string; response_type: 'code'; scope: string; state?: string; code_challenge: string; code_challenge_method: 'S256' };
type TokenInput = { grant_type: 'authorization_code'; code: string; redirect_uri: string; client_id: string; client_secret: string; code_verifier: string };
const CODE_LIFETIME_MS = 2 * 60 * 1000;

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

  let redirect: URL;
  try { redirect = new URL(query.redirect_uri); }
  catch { throw new ServiceError(400, OAUTH_ERROR); }
  const rawCode = generateAuthorizationCode();
  await prisma.authorizationCode.create({ data: { codeHash: hashAuthorizationCode(rawCode), userId: user.id, appId: app.id, redirectUri: query.redirect_uri, scope, codeChallenge: query.code_challenge, codeChallengeMethod: query.code_challenge_method, expiresAt: new Date(Date.now() + CODE_LIFETIME_MS) } });
  redirect.searchParams.set('code', rawCode);
  if (query.state) redirect.searchParams.set('state', query.state);
  return NextResponse.redirect(redirect);
}

export async function exchangeAuthorizationCode(body: TokenInput) {
  const app = await prisma.app.findUnique({ where: { clientId: body.client_id } });
  if (!app || !(await comparePassword(body.client_secret, app.secretKeyHash))) throw new ServiceError(401, 'client doğrulanamadı');
  const code = await prisma.authorizationCode.findFirst({ where: { codeHash: hashAuthorizationCode(body.code), appId: app.id, redirectUri: body.redirect_uri, used: false, expiresAt: { gt: new Date() } }, include: { user: true } });
  if (!code || !code.user.isActive || code.codeChallengeMethod !== 'S256') throw new ServiceError(400, 'authorization code geçersiz');
  if (!safeCompare(createCodeChallenge(body.code_verifier), code.codeChallenge)) throw new ServiceError(400, 'PKCE doğrulaması başarısız');
  const accessToken = generateAccessToken(code.userId);
  const refreshToken = generateRefreshToken(code.userId);
  await prisma.$transaction(async (tx) => {
    const consumed = await tx.authorizationCode.updateMany({ where: { id: code.id, used: false, expiresAt: { gt: new Date() } }, data: { used: true } });
    if (consumed.count !== 1) throw new ServiceError(400, 'authorization code geçersiz');
    await tx.refreshToken.create({ data: { tokenHash: hashRefreshToken(refreshToken), userId: code.userId, appId: app.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  });
  return { access_token: accessToken, refresh_token: refreshToken, token_type: 'Bearer', expires_in: 900 };
}

export async function getUserInfo(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  const requestedScope = typeof request.nextUrl.searchParams.get('scope') === 'string' ? normalizeScope(request.nextUrl.searchParams.get('scope') || '') : 'profile email';
  if (!requestedScope) throw new ServiceError(400, 'desteklenmeyen scope');
  const scopes = new Set(requestedScope.split(' '));
  return { sub: user.id, ...(scopes.has('email') ? { email: user.email } : {}), ...(scopes.has('profile') ? { name: user.name, avatarUrl: user.avatarUrl } : {}) };
}
