"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchReceivedRequestCount } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useSidebar } from "./SidebarContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BrandLogo } from "@/components/brand-logo";
import { CircleOff, LogOut, ShieldCheck, UserRoundPen, UserRoundSearch, X } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Profil", icon: <UserRoundPen size={20} /> },
  { href: "/dashboard/friends", label: "Arkadaşlar", icon: <UserRoundSearch size={20} /> },
  { href: "/dashboard/blocked", label: "Engellenenler", icon: <CircleOff size={20} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const [requestCount, setRequestCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    void fetchReceivedRequestCount()
      .then(setRequestCount)
      .catch(() => setRequestCount(0));
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          aria-label="Menüyü kapat"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-30 flex h-dvh max-h-dvh w-72 max-w-[100vw] shrink-0 -translate-x-full flex-col justify-between overflow-y-auto overflow-x-hidden border-r border-zinc-700 bg-zinc-900 p-5 transition-transform md:static md:translate-x-0 ${mobileOpen ? "translate-x-0" : ""}`}
      >
        <div>
          <div className="mb-10 flex items-center justify-between">
            <BrandLogo href="/dashboard" className="text-lg font-semibold text-white" nameClassName="text-white" />
            <button
              type="button"
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Menüyü kapat"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-8">
            <div>
              <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-zinc-500">HESAP</p>
              <NavItem item={navigation[0]} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div>
              <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-zinc-500">SOSYAL</p>
              {navigation.slice(1).map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                  count={item.href === "/dashboard/friends" ? requestCount : 0}
                />
              ))}
            </div>
            {user?.permissions?.includes("admin.access") && (
              <div>
                <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-zinc-500">YÖNETİM</p>
                <NavItem
                  item={{ href: "/admin", label: "Admin", icon: <ShieldCheck size={20} /> }}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            )}
          </nav>
        </div>
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-t border-zinc-800 pt-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2">
              <UserAvatar size={40} src={user?.avatarUrl} username={user?.username} name={user?.name || user?.email} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {user?.name || user?.username || "Kullanıcı"}
                </p>
                <p className="truncate text-xs text-zinc-500">{user?.email}</p>
              </div>
            </div>
            <button
              className="grid size-8 cursor-pointer self-center justify-self-center shrink-0 place-items-center rounded-lg text-xl text-red-400 hover:bg-zinc-800 hover:text-white"
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              aria-label="Çıkış yap"
              title={loggingOut ? "Çıkılıyor…" : "Çıkış yap"}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  item,
  pathname,
  onNavigate,
  count = 0,
}: {
  item: (typeof navigation)[number];
  pathname: string;
  onNavigate: () => void;
  count?: number;
}) {
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${active ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
    >
      <span className="w-5 text-center">{item.icon}</span>
      <span className="text-md font-semibold">{item.label}</span>
      {count > 0 && <b className="ml-auto rounded-md bg-zinc-600 px-2 py-1 text-xs font-medium">{count}</b>}
    </Link>
  );
}
