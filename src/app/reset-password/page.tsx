"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ApiError, resetPassword } from "@/lib/api";
import { LockOpen, TriangleAlert } from "lucide-react";
import { PageLoader } from "@/components/page-loader";

// URL token'ı ve yeni parola alanlarını yönetir.
function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await resetPassword(token, password);
      router.replace("/login?reset=success");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Şifre sıfırlanamadı.");
    } finally {
      setPending(false);
    }
  }

  return (
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

        <h2 className="text-2xl font-medium text-zinc-100">Yeni şifre</h2>
        <p className="mt-2 text-sm text-zinc-500">Hesabın için yeni bir şifre belirle.</p>

        <div className="mt-8">
          {!token ? (
            <div
              className="flex items-start gap-3 rounded-xl border border-red-900 bg-red-950/30 p-5 text-sm text-red-300"
              role="alert"
            >
              <TriangleAlert className="mt-0.5 size-5 shrink-0" strokeWidth={1.8} />
              <span>Sıfırlama tokenı bulunamadı. Bağlantı süresi dolmuş olabilir.</span>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={submit}>
              <div>
                <label htmlFor="reset-password" className="text-sm font-medium text-zinc-300">
                  Yeni şifre
                </label>
                <input
                  id="reset-password"
                  type="password"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-400"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label htmlFor="reset-password-confirm" className="text-sm font-medium text-zinc-300">
                  Yeni şifre tekrar
                </label>
                <input
                  id="reset-password-confirm"
                  type="password"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-400"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}

              <button
                className="w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                disabled={pending}
              >
                {pending ? "Kaydediliyor…" : "Şifreyi güncelle"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-zinc-400 transition hover:text-zinc-200">
            Girişe dön
          </Link>
        </p>
      </div>
    </div>
  );
}

// Parola sıfırlama sayfasını güvenli Suspense sınırıyla sunar.
export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-zinc-950 lg:grid-cols-[1fr_1fr]">
      <div className="relative hidden items-center justify-center overflow-hidden border-r border-zinc-800 bg-zinc-900 p-12 lg:flex">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-14 inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <span aria-hidden="true" className="text-amber-400">
              ✦
            </span>
            ZYQWAX ID
          </Link>

          <div className="relative rounded-2xl border border-zinc-700 bg-zinc-950 p-6">
            <div className="absolute left-6 top-0 h-3 w-10 -translate-y-1/2 rounded-full bg-zinc-950 ring-1 ring-zinc-700" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500">Erişim kartı</p>
                <p className="mt-0.5 font-mono text-sm text-zinc-300">ZQX-77291-ID</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-400/10 ring-1 ring-amber-400/40">
                <LockOpen className="size-4 text-amber-400" strokeWidth={1.8} />
              </div>
            </div>

            <div className="relative mt-6 h-16 overflow-hidden rounded-lg bg-linear-to-r from-zinc-800 via-zinc-700 to-zinc-800">
              <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-amber-400/25 to-transparent animate-[shimmer_3.2s_ease-in-out_infinite]" />
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-lg font-medium leading-tight text-zinc-100">Kilit açılıyor</p>
                <p className="text-sm text-zinc-500">yeni şifreyle bitecek</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="block w-0.75 bg-zinc-600" style={{ height: `${8 + ((i * 7) % 20)}px` }} />
                ))}
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-zinc-500">Yeni şifreni belirleyince kartın tekrar tamamen etkinleşir.</p>
        </div>
      </div>

      <Suspense
        fallback={
          <PageLoader label="Bağlantı kontrol ediliyor…" />
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
