import type { User } from '@prisma/client';

export const AUTH_ERROR = 'email veya şifre hatalı';
export const SESSION_ERROR = 'geçersiz veya süresi dolmuş oturum';
export const OAUTH_ERROR = 'oauth isteği geçersiz';

export function safeUser(user: User) {
  const { passwordHash, ...publicUser } = user;
  void passwordHash;
  return publicUser;
}

export function bearerToken(value: string | null): string | null {
  const match = value?.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] ?? null;
}
