"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiError, verifyEmail } from "@/lib/api";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";

type VerifyState = "loading" | "success" | "error";

const cardTone: Record<VerifyState, { ring: string; icon: string; iconColor: string; strip: string }> = {
  loading: {
    ring: "ring-zinc-700 bg-zinc-800",
    icon: "text-zinc-500",
    iconColor: "text-zinc-500",
    strip: "bg-zinc-900",
  },
  success: {
    ring: "ring-emerald-400/40 bg-emerald-400/10",
    icon: "text-emerald-400",
    iconColor: "text-emerald-400",
    strip: "from-zinc-800 via-emerald-400/20 to-zinc-800",
  },
  error: {
    ring: "ring-red-500/40 bg-red-500/10",
    icon: "text-red-400",
    iconColor: "text-red-400",
    strip: "bg-red-950/30",
  },
};

// URL'deki doğrulama token'ını otomatik tüketip sonucu gösterir.
function VerifyEmailContent() {
  const params = useSearchParams();
  const requested = useRef(false);
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Email doğrulanıyor…");

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void Promise.resolve().then(() => {
      const token = params.get("token");
      if (!token) {
        setState("error");
        setMessage("Doğrulama tokenı bulunamadı.");
        return;
      }
      return verifyEmail(token)
        .then((result) => {
          setState("success");
          setMessage(result.message);
        })
        .catch((cause) => {
          setState("error");
          setMessage(cause instanceof ApiError ? cause.message : "Email doğrulanamadı.");
        });
    });
  }, [params]);

  const tone = cardTone[state];

  return (
    <div className="flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10 inline-flex lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <span aria-hidden="true" className="text-amber-400">
              ✦
            </span>
            ZYQWAX ID
          </Link>
        </div>

        <div className={`mx-auto flex size-14 items-center justify-center rounded-full ring-1 ${tone.ring}`}>
          {state === "loading" && <Loader2 className={`size-6 animate-spin ${tone.icon}`} strokeWidth={1.8} />}
          {state === "success" && <CircleCheck className={`size-6 ${tone.icon}`} strokeWidth={1.8} />}
          {state === "error" && <CircleX className={`size-6 ${tone.icon}`} strokeWidth={1.8} />}
        </div>

        <h2 className="mt-5 text-2xl font-medium text-zinc-100">
          {state === "success" ? "Hazırsın." : state === "loading" ? "Bir saniye." : "Link çalışmadı."}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">{message}</p>

        <Link
          href="/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white"
        >
          Giriş yap
        </Link>
      </div>
    </div>
  );
}

// Email doğrulama sayfasını kart düzeninde ve Suspense sınırıyla sunar.
export default function VerifyEmailPage() {
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
              <div className="size-10 rounded-lg bg-zinc-800 ring-1 ring-zinc-700" />
            </div>

            <div className="relative mt-6 h-16 overflow-hidden rounded-lg bg-linear-to-r from-zinc-800 via-zinc-700 to-zinc-800">
              <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-amber-400/25 to-transparent animate-[shimmer_3.2s_ease-in-out_infinite]" />
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-lg font-medium leading-tight text-zinc-100">Email doğrulanınca</p>
                <p className="text-sm text-zinc-500">kart tamamen aktif</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="block w-0.75 bg-zinc-600" style={{ height: `${8 + ((i * 7) % 20)}px` }} />
                ))}
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-zinc-500">Bu adım sadece bir kez gerekli.</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-sm rounded-xl border border-zinc-800 p-8 text-center text-zinc-400">
              Yükleniyor…
            </div>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
