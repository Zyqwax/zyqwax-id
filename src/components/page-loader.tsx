import { LoaderCircle } from "lucide-react";

export function PageLoader({ label = "Yükleniyor…" }: { label?: string }) {
  return (
    <div className="flex min-h-60 w-full items-center justify-center bg-zinc-950" role="status" aria-label={label}>
      <div className="flex flex-col items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl border border-zinc-800 bg-zinc-900 text-amber-400 shadow-[0_12px_40px_-16px_rgba(251,191,36,0.45)]">
          <LoaderCircle className="size-6 animate-spin" strokeWidth={1.8} />
        </span>
        <span className="text-sm text-zinc-500">{label}</span>
      </div>
    </div>
  );
}
