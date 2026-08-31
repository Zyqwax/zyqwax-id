"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, forgotPassword } from "@/lib/api";
import { Lock, MailCheck } from "lucide-react";

// Parola sıfırlama emaili isteyen ortalanmış formu yönetir.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      setMessage((await forgotPassword(email)).message);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "İstek gönderilemedi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-zinc-950 lg:grid-cols-[1fr_1fr]">
      {/* Sol taraf — kilitli kart görseli */}
      <div className="relative hidden items-center justify-center overflow-hidden border-r border-zinc-800 bg-zinc-900 p-12 lg:flex">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-14 inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <span aria-hidden="true" className="text-amber-400">
              ✦
            </span>
            ZYQWAX ID
          </Link>

          <div className="relative rounded-2xl border border-zinc-700 bg-zinc-950 p-6 opacity-70">
            <div className="absolute left-6 top-0 h-3 w-10 -translate-y-1/2 rounded-full bg-zinc-950 ring-1 ring-zinc-700" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500">Erişim kartı</p>
                <p className="mt-0.5 font-mono text-sm text-zinc-400">ZQX-77291-ID</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700">
                <Lock className="size-4 text-zinc-500" strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-6 flex h-16 items-center justify-center rounded-lg bg-zinc-900">
              <span className="text-xs text-zinc-600">Geçici olarak kilitli</span>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-lg font-medium leading-tight text-zinc-400">Yeni şifreyle</p>
                <p className="text-sm text-zinc-600">tekrar etkinleşir</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="block w-0.75 bg-zinc-800" style={{ height: `${8 + ((i * 7) % 20)}px` }} />
                ))}
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-zinc-500">Sıfırlama bağlantısına tıklayınca kartın hemen kilidi açılır.</p>
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

          <h2 className="text-2xl font-medium text-zinc-100">Şifremi unuttum</h2>
          <p className="mt-2 text-sm text-zinc-500">Email adresini yaz; varsa sıfırlama bağlantısını gönderelim.</p>

          <div className="mt-8">
            {message ? (
              <div
                className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-300"
                role="status"
              >
                <MailCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" strokeWidth={1.8} />
                <span>{message}</span>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={submit}>
                <div>
                  <label htmlFor="forgot-email" className="text-sm font-medium text-zinc-300">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="mt-1 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-400"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="sen@ornek.com"
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
                  {pending ? "Gönderiliyor…" : "Sıfırlama emaili gönder"}
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
    </main>
  );
}
