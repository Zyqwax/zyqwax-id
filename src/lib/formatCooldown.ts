// Cooldown süresini kullanıcıya okunabilir kısa bir Türkçe metne çevirir.
export function formatRelativeCooldown(nextAllowedAt: Date, now = Date.now()): string {
  const remainingMs = Math.max(0, nextAllowedAt.getTime() - now);
  const hours = Math.ceil(remainingMs / (60 * 60 * 1000));
  if (hours >= 24) return `${Math.ceil(hours / 24)} gün sonra değiştirilebilir`;
  return `${Math.max(1, hours)} saat sonra değiştirilebilir`;
}
