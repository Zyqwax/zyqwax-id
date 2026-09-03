"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

const titles: Record<string, string> = {
  "/dashboard": "Profil",
  "/dashboard/friends": "Arkadaşlar",
  "/dashboard/blocked": "Engellenenler",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <header className="flex h-20 min-w-0 items-center justify-between border-b border-zinc-800 px-5 sm:px-10">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Menüyü aç"
          aria-controls="dashboard-sidebar"
          aria-expanded={mobileOpen}
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>Dashboard</span>
          <span className="font-normal text-zinc-700">/</span>
          <span className="font-medium text-zinc-200">{titles[pathname] ?? "Zyqwax ID"}</span>
        </div>
      </div>
    </header>
  );
}
