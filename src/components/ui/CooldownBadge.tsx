'use client';

import { useEffect, useState } from 'react';
import { formatRelativeCooldown } from '@/lib/formatCooldown';

// Bir alanın tekrar düzenlenebileceği zamanı sade bir rozetle gösterir.
export function CooldownBadge({ nextAllowedAt }: { nextAllowedAt: Date | null }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!nextAllowedAt) return;
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [nextAllowedAt]);
  if (!nextAllowedAt || !now || nextAllowedAt.getTime() <= now) return null;
  return <span className="rounded-md bg-bg-elevated px-2 py-1 text-[11px] text-text-muted">{formatRelativeCooldown(nextAllowedAt, now)}</span>;
}
