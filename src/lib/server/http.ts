import type { User } from '@prisma/client';

export const AUTH_ERROR = 'email veya şifre hatalı';
export const SESSION_ERROR = 'geçersiz veya süresi dolmuş oturum';
export const OAUTH_ERROR = 'oauth isteği geçersiz';

export function safeUser(user: User & { roles?: { roleId: string; role?: { permissions: { permission: { tag: string } }[] } }[] }) {
  const { passwordHash, roles, ...publicUser } = user;
  void passwordHash;
  const permissions = roles ? [...new Set(roles.flatMap(role => role.role?.permissions.map(({ permission }) => permission.tag) ?? []))] : undefined;
  return { ...publicUser, ...(roles ? { roles: roles.map(({ roleId }) => roleId), permissions } : {}) };
}

export function bearerToken(value: string | null): string | null {
  const match = value?.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] ?? null;
}
