"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Profil",
  "/dashboard/friends": "Arkadaşlar",
  "/dashboard/blocked": "Engellenenler",
};

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-800 px-5 sm:px-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>Dashboard</span>
          <span className="font-normal text-zinc-700">/</span>
          <span className="font-medium text-zinc-200">{titles[pathname] ?? "Zyqwax ID"}</span>
        </div>
      </div>
    </header>
  );
}
