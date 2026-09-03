"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <span aria-hidden="true" className="text-amber-400">
            ✦
          </span>
          ZYQWAX ID
        </Link>

        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/40">
          <TriangleAlert className="size-6 text-red-400" strokeWidth={1.8} />
        </div>

        <h1 className="mt-5 text-2xl font-medium text-zinc-100">Bir aksaklık oldu.</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sayfa yüklenirken beklenmedik bir hata oluştu. Tekrar deneyebilirsin.
        </p>

        <button
          onClick={reset}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white cursor-pointer"
        >
          <RotateCcw className="size-4" />
          Yeniden dene
        </button>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-zinc-400 transition hover:text-zinc-200">
            Ana sayfaya dön
          </Link>
        </p>
      </div>
    </main>
  );
}
