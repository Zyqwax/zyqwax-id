import Image from "next/image";

export function UserAvatar({ src, name, size = 96, className = '' }: { src?: string | null; name?: string | null; size?: number; className?: string }) {
  const displayName = name?.trim() || "Zyqwax User";
  const avatarSrc =
    src ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=27272a&color=ffffff&bold=true`;
  return <Image src={avatarSrc} alt="" width={size} height={size} className={className} />;
}
