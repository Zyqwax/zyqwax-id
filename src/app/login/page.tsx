import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { PublicRoute } from "@/components/public-route";
import { PageLoader } from "@/components/page-loader";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = { title: "Giriş yap" };

export default function LoginPage() {
  return (
    <PublicRoute>
      <main className="grid min-h-screen grid-cols-1 bg-zinc-950 lg:grid-cols-[1fr_1fr]">
        {/* Sol taraf — kimlik kartı görseli */}
        <div className="relative hidden items-center justify-center overflow-hidden border-r border-zinc-800 bg-zinc-900 p-12 lg:flex">
          <div className="w-full max-w-sm">
            <BrandLogo className="mb-14 text-sm font-semibold" nameClassName="text-zinc-100" />

            {/* Kart */}
            <div className="relative rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
              {/* Delik */}
              <div className="absolute left-6 top-0 h-3 w-10 -translate-y-1/2 rounded-full bg-zinc-950 ring-1 ring-zinc-700" />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Erişim kartı</p>
                  <p className="mt-0.5 font-mono text-sm text-zinc-300">ZQX-77291-ID</p>
                </div>
                <div className="size-10 rounded-lg bg-zinc-800 ring-1 ring-zinc-700" />
              </div>

              {/* Hologram şeridi */}
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

            <p className="mt-8 text-sm text-zinc-500">
              Bu kart, tüm ZYQWAX oturumlarının tek giriş noktası. Nerede oturum açtığın önemli değil.
            </p>
          </div>
        </div>

        {/* Sağ taraf — form paneli */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-10 lg:hidden">
              <BrandLogo className="text-sm font-semibold" nameClassName="text-zinc-100" />
            </div>

            <h2 className="text-2xl font-medium text-zinc-100">Giriş yap</h2>
            <p className="mt-2 text-sm text-zinc-500">Devam etmek için bilgilerini gir.</p>

            <div className="mt-8">
              <Suspense
                fallback={
                  <PageLoader label="Form hazırlanıyor…" />
                }
              >
                <AuthForm mode="login" />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </PublicRoute>
  );
}
