import { prisma } from './prisma';

export const ROLE_ID = {
  defaultUser: 'role_user',
  administrator: 'role_administrator',
} as const;

export const PERMISSION = {
  profileLimitsBypass: 'profile.limits.bypass',
} as const;

// Yetkiler rol adına/displayName'e göre değil, sabit permission tag'ine göre kontrol edilir.
export async function checkPerm(userId: string, permissionTag: string): Promise<boolean> {
  const assignment = await prisma.userRoleAssignment.findFirst({
    where: {
      userId,
      role: { permissions: { some: { permission: { tag: permissionTag } } } },
    },
    select: { userId: true },
  });
  return assignment !== null;
}

export async function canBypassProfileLimits(userId: string): Promise<boolean> {
  return checkPerm(userId, PERMISSION.profileLimitsBypass);
}
