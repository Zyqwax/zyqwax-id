import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ServiceError } from './auth-service';
import { getAuthenticatedUserFromRequest } from './auth-service';
import { checkPerm } from './roles';

export function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export function badRequest(message = 'geçersiz istek', details?: unknown): NextResponse {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status: 400 });
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) return badRequest('geçersiz istek', error.issues);
  if (error instanceof ServiceError) return NextResponse.json({ error: error.message }, { status: error.status });
  return NextResponse.json({ error: 'sunucu hatası' }, { status: 500 });
}

export function rateLimited(retryAfter: number): NextResponse {
  return NextResponse.json({ error: 'çok fazla istek, lütfen daha sonra tekrar deneyin' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } });
}

// Profil alanı cooldown hatalarında istemcinin yeniden deneyebileceği zamanı bildirir.
export function profileRateLimited(nextAllowedAt?: Date): NextResponse {
  return NextResponse.json({ error: 'bu alan için değişiklik limiti doldu', ...(nextAllowedAt ? { nextAllowedAt: nextAllowedAt.toISOString() } : {}) }, { status: 429 });
}

export async function requirePermission(request: import('next/server').NextRequest, permission: string) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!(await checkPerm(user.id, permission))) throw new ServiceError(403, 'bu işlem için yetkiniz yok');
  return user;
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) throw new ServiceError(403, 'geçersiz istek kaynağı');
}
