'use client';

// Düzenleme formlarını sayfa akışını bozmadan sade bir overlay içinde sunar.
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-canvas/80 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="modal-card w-full max-w-md rounded-xl border border-border-default bg-bg-surface p-7">
      <div className="mb-5 flex items-center justify-between"><h2 id="modal-title" className="text-base font-medium text-text-primary">{title}</h2><button className="text-text-muted" type="button" onClick={onClose} aria-label="Kapat">×</button></div>
      {children}
    </div>
  </div>;
}
