import { z } from 'zod';
import { usernameSchema } from '@/lib/validation/username';

export const registerSchema = z.object({ email: z.string().email().max(254), username: usernameSchema, password: z.string().min(8).regex(/\d/, 'password must contain at least one digit') }).strict();
export const loginSchema = z.object({ identifier: z.string().trim().min(1).max(254), password: z.string().min(1) }).strict();
export const authorizeQuerySchema = z.object({ client_id: z.string().min(1).max(200), redirect_uri: z.string().min(1).max(2048), response_type: z.literal('code'), scope: z.string().trim().min(1).max(500).default('profile email'), state: z.string().min(1).max(2048).optional(), code_challenge: z.string().length(43), code_challenge_method: z.literal('S256') }).strict();
export const tokenBodySchema = z.object({ grant_type: z.literal('authorization_code'), code: z.string().min(1).max(512), redirect_uri: z.string().min(1).max(2048), client_id: z.string().min(1).max(200), client_secret: z.string().min(1).max(1024), code_verifier: z.string().min(43).max(128) }).strict();

export function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }
export function normalizeScope(scope: string): string | null {
  const requested = [...new Set(scope.trim().split(/\s+/).filter(Boolean))];
  if (!requested.length) return 'profile email';
  return requested.every((item) => item === 'profile' || item === 'email') ? requested.join(' ') : null;
}
