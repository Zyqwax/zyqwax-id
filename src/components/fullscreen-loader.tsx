// src/components/fullscreen-loader.tsx
"use client";

import { ShieldCheck } from "lucide-react";

export function FullscreenLoader() {
  return (
    <div
      className="fixed inset-0 z-9999 flex min-h-dvh items-center justify-center bg-zinc-950"
      role="status"
      aria-label="Oturum kontrol ediliyor"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/3 blur-3xl"
      />

      <div className="relative flex flex-col items-center">
        <div className="relative w-64 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          <div className="absolute left-5 top-0 h-2.5 w-9 -translate-y-1/2 rounded-full bg-zinc-950 ring-1 ring-zinc-700" />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">ZYQWAX ID</p>

              <p className="mt-1 font-mono text-xs text-zinc-400">SESSION CHECK</p>
            </div>

            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-800 text-amber-400 ring-1 ring-zinc-700">
              <ShieldCheck className="size-4" strokeWidth={1.8} />
            </div>
          </div>

          <div className="relative mt-5 h-12 overflow-hidden rounded-lg bg-linear-to-r from-zinc-800 via-zinc-700 to-zinc-800">
            <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-[loading-shimmer_1.8s_ease-in-out_infinite] bg-linear-to-r from-transparent via-amber-400/15 to-transparent" />
          </div>

          <div className="mt-5">
            <div className="h-2 w-24 rounded-full bg-zinc-800" />
            <div className="mt-2 h-2 w-16 rounded-full bg-zinc-800/60" />
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />

          <p className="text-xs font-medium tracking-wide text-zinc-500">Oturum kontrol ediliyor</p>
        </div>
      </div>
    </div>
  );
}
