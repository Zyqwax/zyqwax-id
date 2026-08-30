const AVATAR_WINDOW_MS = 24 * 60 * 60 * 1000;

// Alan değişikliklerinin son işlem zamanına göre cooldown uygular.
export function canChangeField(lastChangedAt: Date | null, cooldownMs: number): { allowed: boolean; nextAllowedAt?: Date } {
  if (!lastChangedAt) return { allowed: true };
  const nextAllowedAt = new Date(lastChangedAt.getTime() + cooldownMs);
  return nextAllowedAt.getTime() <= Date.now() ? { allowed: true } : { allowed: false, nextAllowedAt };
}

// Avatar için 24 saatlik pencerede en fazla iki değişiklik hakkı tanır.
export function canChangeAvatar(count: number, windowStart: Date | null): { allowed: boolean; remaining: number } {
  if (!windowStart || windowStart.getTime() + AVATAR_WINDOW_MS <= Date.now()) return { allowed: true, remaining: 2 };
  const remaining = Math.max(0, 2 - count);
  return { allowed: count < 2, remaining };
}
