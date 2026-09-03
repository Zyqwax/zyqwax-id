import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
  markClassName?: string;
  nameClassName?: string;
  showName?: boolean;
};

export function BrandLogo({
  href = "/",
  onClick,
  className = "",
  markClassName = "size-9",
  nameClassName = "",
  showName = true,
}: BrandLogoProps) {
  return (
    <Link href={href} onClick={onClick} className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`grid shrink-0 place-items-center rounded-lg p-1 ${markClassName}`}>
        <Image src="/Z-mark-square.png" alt="" width={32} height={32} className="size-full object-contain" priority />
      </span>
      {showName && <span className={nameClassName}>ZYQWAX ID</span>}
    </Link>
  );
}
