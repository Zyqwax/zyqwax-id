'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useSidebar } from './SidebarContext';

const titles: Record<string, string> = { '/dashboard': 'Profil', '/dashboard/friends': 'Arkadaşlar', '/dashboard/requests': 'İstekler', '/dashboard/blocked': 'Engellenenler' };

// Referans admin arayüzündeki üst başlık, mobil menü ve kullanıcı özetini sunar.
export function DashboardHeader() {
  const pathname = usePathname(); const { setMobileOpen } = useSidebar(); const { user } = useAuth();
  return <header className="dashboard-topbar"><button className="mobile-menu-button" type="button" aria-label="Menüyü aç" onClick={() => setMobileOpen(true)}><span /><span /><span /></button><div className="breadcrumb"><span>Dashboard</span><strong>/</strong><b>{titles[pathname] ?? 'Zyqwax ID'}</b></div><div className="topbar-user">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{(user?.name || user?.username || user?.email || 'Z').slice(0, 1).toUpperCase()}</span>}<div><strong>{user?.name || user?.username || 'Kullanıcı'}</strong><small>{user?.email}</small></div></div></header>;
}
