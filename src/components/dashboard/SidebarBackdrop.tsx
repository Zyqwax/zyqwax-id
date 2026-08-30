'use client';

import { useSidebar } from './SidebarContext';

// Mobil navigasyon açıkken içeriği örter ve tıklamayla menüyü kapatır.
export function SidebarBackdrop() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  if (!mobileOpen) return null;
  return <button className="sidebar-backdrop" type="button" aria-label="Menüyü kapat" onClick={() => setMobileOpen(false)} />;
}
