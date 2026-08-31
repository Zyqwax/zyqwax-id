import Link from "next/link";
// import { PublicRoute } from "@/components/public-route";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <span aria-hidden="true" className="text-amber-400">
            ✦
          </span>
          ZYQWAX ID
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
          >
            Giriş yap
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
          >
            Hesap oluştur
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-16 sm:px-12 lg:grid-cols-2 lg:py-24">
        <div>
          <h1 className="text-4xl font-medium leading-tight text-zinc-100 sm:text-5xl">
            Tek kart,
            <br />
            her yerde sen.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">
            ZYQWAX ID, hesabını tüm bağlantılarınla birlikte tek bir kimlikte tutar. Nerede oturum açtığın önemli değil,
            kartın hep seninle.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white"
            >
              Kartını oluştur
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900"
            >
              Zaten hesabım var
            </Link>
          </div>
        </div>

        {/* Keycard görseli — auth sayfalarındaki aktif kartla aynı */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
            <div className="absolute left-6 top-0 h-3 w-10 -translate-y-1/2 rounded-full bg-zinc-950 ring-1 ring-zinc-700" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500">Erişim kartı</p>
                <p className="mt-0.5 font-mono text-sm text-zinc-300">ZQX-77291-ID</p>
              </div>
              <div className="size-10 rounded-lg bg-zinc-800 ring-1 ring-zinc-700" />
            </div>

            <div className="relative mt-6 h-16 overflow-hidden rounded-lg bg-linear-to-r from-zinc-800 via-zinc-700 to-zinc-800">
              <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-amber-400/25 to-transparent animate-[shimmer_3.2s_ease-in-out_infinite]" />
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-lg font-medium leading-tight text-zinc-100">Oturumun</p>
                <p className="text-sm text-zinc-500">tek karta bağlı</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="block w-0.75 bg-zinc-600" style={{ height: `${8 + ((i * 7) % 20)}px` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Kartın altında hafif bir gölge/duplicate ile derinlik */}
          <div className="absolute inset-x-6 -bottom-3 -z-10 h-full rounded-2xl border border-zinc-800 bg-zinc-900/40" />
        </div>
      </section>

      {/* Özellikler */}
      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<KeyRound className="size-5" strokeWidth={1.8} />}
            title="Tek kimlik"
            description="Kullanıcı adın, email'in ve şifren tek kartta; her serviste tekrar kayıt olmana gerek yok."
          />
          <FeatureCard
            icon={<ShieldCheck className="size-5" strokeWidth={1.8} />}
            title="Sen kontrol edersin"
            description="Kimi engelleyeceğine, kiminle bağlantı kuracağına her zaman sen karar verirsin."
          />
          <FeatureCard
            icon={<Sparkles className="size-5" strokeWidth={1.8} />}
            title="Anında etkin"
            description="Kartın oluşturulduğu anda aktif olur; email doğrulaması sadece bir dakikanı alır."
          />
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-8 sm:px-12">
        <p className="text-center text-sm text-zinc-600">ZYQWAX ID</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800 text-amber-400 ring-1 ring-zinc-700">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-medium text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}
