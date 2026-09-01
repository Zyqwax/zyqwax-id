"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchReceivedRequestCount } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useSidebar } from "./SidebarContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CircleOff, LogOut, ShieldCheck, UserRoundPen, UserRoundSearch } from "lucide-react";

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
        className={`fixed inset-y-0 left-0 z-30 flex h-screen max-h-screen w-72 -translate-x-full flex-col justify-between overflow-hidden border-r border-zinc-700 bg-zinc-900 p-5 transition-transform md:static md:translate-x-0 ${mobileOpen ? "translate-x-0" : ""}`}
      >
        <div>
          <div className="mb-10 flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-lg font-semibold text-white"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-zinc-100 text-zinc-900">Z</span>Zyqwax ID
            </Link>
            <span className="text-zinc-500">•••</span>
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
            {user?.permissions?.includes("admin.access") && <div>
              <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-zinc-500">YÖNETİM</p>
              <NavItem item={{ href: "/admin", label: "Admin", icon: <ShieldCheck size={20} /> }} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>}
          </nav>
        </div>
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
            <div className="mb-2 text-lg text-zinc-300">✦</div>
            <p className="font-semibold text-white">Hesabını yükselt</p>
            <p className="my-2 text-sm leading-5 text-zinc-400">Daha fazla özellik ve depolama alanı.</p>
            <button
              type="button"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200"
            >
              Yakında
            </button>
          </div>
          <div className="flex items-center gap-2 border-t border-zinc-800 pt-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2">
              <UserAvatar
                size={40}
                src={user?.avatarUrl}
                name={user?.name || user?.username || user?.email}
                className="size-10 shrink-0 rounded-full object-cover"
              />
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
