import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { PublicRoute } from "@/components/public-route";
import { PageLoader } from "@/components/page-loader";

export const metadata = { title: "Kayıt ol" };

export default function RegisterPage() {
  return (
    <PublicRoute>
      <main className="grid min-h-screen grid-cols-1 bg-zinc-950 lg:grid-cols-[1fr_1fr]">
        {/* Sol taraf — kimlik kartı görseli */}
        <div className="relative hidden items-center justify-center overflow-hidden border-r border-zinc-800 bg-zinc-900 p-12 lg:flex">
          <div className="w-full max-w-sm">
            <Link href="/" className="mb-14 inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <span aria-hidden="true" className="text-amber-400">
                ✦
              </span>
              ZYQWAX ID
            </Link>

            {/* Kart — henüz basılmamış */}
            <div className="relative rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-6">
              <div className="absolute left-6 top-0 h-3 w-10 -translate-y-1/2 rounded-full bg-zinc-950 ring-1 ring-zinc-700" />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Erişim kartı</p>
                  <p className="mt-0.5 font-mono text-sm text-zinc-500">ZQX-•••••-ID</p>
                </div>
                <div className="size-10 rounded-lg border border-dashed border-zinc-700" />
              </div>

              {/* Hologram şeridi — henüz basılmamış */}
              <div className="mt-6 flex h-16 items-center justify-center rounded-lg border border-dashed border-zinc-700">
                <span className="text-xs text-zinc-600">Kartın seninle basılacak</span>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-medium leading-tight text-zinc-300">Adına</p>
                  <p className="text-sm text-zinc-600">hazır bekliyor</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className="block w-0.75 bg-zinc-800" style={{ height: `${8 + ((i * 7) % 20)}px` }} />
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-8 text-sm text-zinc-500">
              E-posta, kullanıcı adı ve şifreni gir; kartın anında etkinleşir.
            </p>
          </div>
        </div>

        {/* Sağ taraf — form paneli */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-10 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
                <span aria-hidden="true" className="text-amber-400">
                  ✦
                </span>
                ZYQWAX ID
              </Link>
            </div>

            <h2 className="text-2xl font-medium text-zinc-100">Hesap oluştur</h2>
            <p className="mt-2 text-sm text-zinc-500">Sadece gerekli bilgiler. Sonra gerisi kolay.</p>

            <div className="mt-8">
              <Suspense
                fallback={
                  <PageLoader label="Form hazırlanıyor…" />
                }
              >
                <AuthForm mode="register" />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </PublicRoute>
  );
}
