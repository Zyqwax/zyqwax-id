"use client";

// Düzenleme formlarını sayfa akışını bozmadan sade bir overlay içinde sunar.
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-7 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-semibold text-white">
            {title}
          </h2>
          <button
            className="grid size-9 place-items-center rounded-lg text-2xl text-zinc-400 hover:bg-zinc-800 hover:text-white"
            type="button"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
