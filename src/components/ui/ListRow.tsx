"use client";

import { UserAvatar } from "./UserAvatar";

// Kullanıcı listelerinde profil ve aksiyonları aynı satırda sunan bileşen.
export function ListRow({
  title,
  username,
  subtitle,
  avatarUrl,
  actions,
}: {
  title: string;
  username?: string | null;
  subtitle?: string;
  avatarUrl?: string | null;
  actions?: React.ReactNode;
}) {
  const initial = title.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <div className="flex items-center gap-3 rounded-[10px] bg-bg-elevated px-4 py-3">
      <UserAvatar size={40} src={avatarUrl} username={username} name={title || initial} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-text-primary">{title}</p>
        {subtitle && <p className="truncate text-xs text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
