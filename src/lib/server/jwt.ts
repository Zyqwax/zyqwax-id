import { createHash } from 'node:crypto';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { getServerEnv } from './env';

const algorithm = 'HS256' as const;

export function generateAccessToken(userId: string, scope?: string): string {
  return jwt.sign({ sub: userId, ...(scope ? { scope } : {}) }, getServerEnv().JWT_ACCESS_SECRET, { algorithm, expiresIn: '15m' } as SignOptions);
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, getServerEnv().JWT_REFRESH_SECRET, { algorithm, expiresIn: '7d' } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getServerEnv().JWT_ACCESS_SECRET, { algorithms: [algorithm] }) as JwtPayload;
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
