import type { SafeUser } from './types';

type AuthChangeListener = (user: SafeUser | null) => void;

let accessToken: string | null = null;
let user: SafeUser | null = null;
let listener: AuthChangeListener | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(nextToken: string): void {
  accessToken = nextToken;
}

export function setSession(nextToken: string, nextUser: SafeUser | null): void {
  accessToken = nextToken;
  user = nextUser;
  listener?.(nextUser);
}

export function setUser(nextUser: SafeUser | null): void {
  user = nextUser;
  listener?.(nextUser);
}

export function getUser(): SafeUser | null {
  return user;
}

export function clearSession(): void {
  accessToken = null;
  user = null;
  listener?.(null);
}

export function subscribeToAuthChanges(nextListener: AuthChangeListener): () => void {
  listener = nextListener;
  return () => {
    if (listener === nextListener) listener = null;
  };
}
