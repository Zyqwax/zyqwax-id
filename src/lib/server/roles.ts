export const ROLE = {
  user: 0,
  developer: 1,
  admin: 2,
} as const;

// Developer ve admin hesapları profil değişikliklerindeki kullanıcı limitlerinden muaftır.
export function canBypassProfileLimits(role: number | null | undefined): boolean {
  const normalizedRole = Number(role ?? ROLE.user);
  return (normalizedRole & ROLE.developer) === ROLE.developer || (normalizedRole & ROLE.admin) === ROLE.admin;
}
