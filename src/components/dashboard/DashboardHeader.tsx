"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

const titles: Record<string, string> = {
  "/dashboard": "Profil",
  "/dashboard/friends": "Arkadaşlar",
  "/dashboard/requests": "İstekler",
  "/dashboard/blocked": "Engellenenler",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebar();
  return (
    <header className="flex h-20 items-center border-b border-zinc-800 px-5 sm:px-10">
      <div className="flex items-center gap-4">
        <button
          className="grid gap-1.5 rounded-lg p-2 md:hidden"
          type="button"
          aria-label="Menüyü aç"
          onClick={() => setMobileOpen(true)}
        >
          <span className="h-0.5 w-5 bg-zinc-400" />
          <span className="h-0.5 w-5 bg-zinc-400" />
          <span className="h-0.5 w-5 bg-zinc-400" />
        </button>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>Dashboard</span>
          <strong className="font-normal text-zinc-700">/</strong>
          <b className="font-medium text-zinc-200">{titles[pathname] ?? "Zyqwax ID"}</b>
        </div>
      </div>
    </header>
  );
}
