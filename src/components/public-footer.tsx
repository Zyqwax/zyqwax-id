import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const productLinks = [
  { href: "#features", label: "Özellikler" },
  { href: "/dashboard", label: "Hesap yönetimi" },
];

const accountLinks = [
  { href: "/login", label: "Giriş yap" },
  { href: "/register", label: "Hesap oluştur" },
  { href: "/forgot-password", label: "Şifremi unuttum" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-14 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] lg:gap-24">
          <div className="max-w-sm">
            <BrandLogo nameClassName="text-zinc-100" />
            <p className="mt-5 text-sm leading-relaxed text-zinc-500">
              Dijital kimliğini, hesabını ve bağlantılarını tek bir güvenli merkezden yönet.
            </p>
          </div>

          <FooterColumn title="Ürün" links={productLinks} />
          <FooterColumn title="Hesap" links={accountLinks} />
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-zinc-900 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ZYQWAX ID. Tüm hakları saklıdır.</p>
          <p>Güvenli kimlik altyapısı</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{title}</h2>
      <nav aria-label={`${title} bağlantıları`} className="mt-5 space-y-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block text-sm text-zinc-500 transition hover:text-zinc-100">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
