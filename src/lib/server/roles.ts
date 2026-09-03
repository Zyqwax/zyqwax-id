import { prisma } from './prisma';

export const ROLE_ID = {
  defaultUser: 'role_user',
  administrator: 'role_administrator',
} as const;

export const PERMISSION = {
  adminAccess: 'admin.access',
  usersRead: 'users.read',
  rolesManage: 'roles.manage',
  usersRolesUpdate: 'users.roles.update',
  loginHistoryRead: 'login_history.read',
  oauthClientsRead: 'oauth_clients.read',
  oauthClientsCreate: 'oauth_clients.create',
  oauthClientsUpdate: 'oauth_clients.update',
  oauthClientsDelete: 'oauth_clients.delete',
  profileLimitsBypass: 'profile.limits.bypass',
} as const;

export const userAccessInclude = {
  roles: {
    select: {
      roleId: true,
      role: { select: { permissions: { select: { permission: { select: { tag: true } } } } } },
    },
  },
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

export async function requirePerm(userId: string, permissionTag: string): Promise<void> {
  if (!(await checkPerm(userId, permissionTag))) throw new (await import('./auth-service')).ServiceError(403, 'bu işlem için yetkiniz yok');
}

export async function canBypassProfileLimits(userId: string): Promise<boolean> {
  return checkPerm(userId, PERMISSION.profileLimitsBypass);
}
