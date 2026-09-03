import Image from "next/image";

export function UserAvatar({
  src,
  username,
  name,
  size = 40,
  className = "",
}: {
  src?: string | null;
  username?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const identity = username?.trim() || name?.trim() || "user";
  const initials = getInitials(identity);
  const label = username?.trim() ? `@${username.trim()} avatarı` : `${identity} avatarı`;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-sm font-semibold uppercase tracking-wide text-zinc-100 ring-1 ring-zinc-700 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}

function getInitials(value: string): string {
  const parts = value.split(/[\s._-]+/).filter(Boolean);
  if (parts.length > 1) return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return value.slice(0, 2).toUpperCase();
}
