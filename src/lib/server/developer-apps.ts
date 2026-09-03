import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from './prisma';
import { hashPassword } from './password';
import { ServiceError } from './auth-service';
import { ROLE_ID } from './roles';

export const DEVELOPER_SCOPES = ['profile', 'email', 'friends', 'blocks'] as const;

export const developerAppSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().default(''),
  redirectUris: z.array(z.string().url().max(2048)).min(1).max(20),
  allowedOrigins: z.array(z.string().url().max(512)).max(20).default([]),
  allowedScopes: z.array(z.enum(DEVELOPER_SCOPES)).min(1).max(DEVELOPER_SCOPES.length).default(['profile', 'email']),
});

export const developerAppUpdateSchema = developerAppSchema.extend({ isActive: z.boolean().optional() });

export const appSelect = {
  id: true, clientId: true, name: true, description: true, redirectUris: true,
  allowedOrigins: true, allowedScopes: true, isActive: true, createdAt: true, updatedAt: true,
} as const;

export async function getOwnedDeveloperApp(userId: string, id: string) {
  const app = await prisma.app.findFirst({ where: { id, ownerId: userId }, select: appSelect });
  if (!app) throw new ServiceError(404, 'uygulama bulunamadı');
  return app;
}

export async function createDeveloperApp(userId: string, input: z.infer<typeof developerAppSchema>) {
  const clientSecret = randomBytes(32).toString('base64url');
  const app = await prisma.app.create({
    data: { ...input, ownerId: userId, secretKeyHash: await hashPassword(clientSecret) },
    select: appSelect,
  });
  return { app, clientSecret };
}

export async function rotateDeveloperSecret(userId: string, id: string) {
  await getOwnedDeveloperApp(userId, id);
  const clientSecret = randomBytes(32).toString('base64url');
  await prisma.app.update({ where: { id }, data: { secretKeyHash: await hashPassword(clientSecret) } });
  return clientSecret;
}

export async function ensureDeveloperRole(userId: string) {
  await prisma.userRoleAssignment.upsert({ where: { userId_roleId: { userId, roleId: ROLE_ID.developer } }, create: { userId, roleId: ROLE_ID.developer }, update: {} });
}
