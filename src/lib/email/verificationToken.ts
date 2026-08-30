import { createHash, randomBytes } from 'node:crypto';
import type { VerificationTokenType } from '@prisma/client';

// JWT yerine tek kullanımlık opak doğrulama token'ı üretir.
export function generateToken(): string { return randomBytes(32).toString('hex'); }

// Ham token'ı veritabanında saklanmak üzere SHA-256 ile özetler.
export function hashToken(token: string): string { return createHash('sha256').update(token).digest('hex'); }

// Token tipine göre geçerlilik süresini hesaplar.
export function tokenExpiry(type: VerificationTokenType): Date { const duration = type === 'EMAIL_VERIFY' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; return new Date(Date.now() + duration); }
