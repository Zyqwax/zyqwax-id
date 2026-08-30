import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function generateAuthorizationCode(): string { return randomBytes(32).toString('base64url'); }
export function hashAuthorizationCode(code: string): string { return createHash('sha256').update(code, 'utf8').digest('hex'); }
export function createCodeChallenge(verifier: string): string { return createHash('sha256').update(verifier, 'utf8').digest('base64url'); }
export function safeCompare(left: string, right: string): boolean {
  const a = Buffer.from(left, 'utf8'); const b = Buffer.from(right, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
