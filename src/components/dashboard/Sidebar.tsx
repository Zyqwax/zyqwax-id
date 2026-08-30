'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchReceivedRequestCount } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { useSidebar } from './SidebarContext';

const account = [{ href: '/dashboard', label: 'Profil', icon: '◈' }];
const social = [{ href: '/dashboard/friends', label: 'Arkadaşlar', icon: '♧' }, { href: '/dashboard/requests', label: 'İstekler', icon: '↔' }, { href: '/dashboard/blocked', label: 'Engellenenler', icon: '⊘' }];

// Referans admin tasarımındaki genişleyebilir navigasyon ve çıkış alanını sunar.
export function Sidebar() {
  const pathname = usePathname(); const { logout } = useAuth(); const { expanded, mobileOpen, toggleExpanded, setMobileOpen } = useSidebar(); const [requestCount, setRequestCount] = useState(0); const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => { void Promise.resolve().then(() => fetchReceivedRequestCount().then(setRequestCount).catch(() => setRequestCount(0))); }, [pathname]);
  async function handleLogout() { setLoggingOut(true); try { await logout(); } finally { setLoggingOut(false); } }
  const renderItem = ({ href, label, icon }: { href: string; label: string; icon: string }) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setMobileOpen(false)} className={`dashboard-nav-item ${pathname === href ? 'is-active' : ''}`}><span className="dashboard-nav-icon" aria-hidden="true">{icon}</span>{(expanded || mobileOpen) && <span>{label}</span>}{href === '/dashboard/requests' && requestCount > 0 && <b className="request-count">{requestCount}</b>}</Link>;
  return <aside className={`dashboard-sidebar ${expanded ? 'is-expanded' : 'is-collapsed'} ${mobileOpen ? 'is-mobile-open' : ''}`}><div className="sidebar-brand"><Link href="/dashboard" onClick={() => setMobileOpen(false)}><span className="sidebar-logo">Z</span>{(expanded || mobileOpen) && <span>Zyqwax ID</span>}</Link><button className="sidebar-collapse" type="button" onClick={toggleExpanded} aria-label={expanded ? 'Menüyü daralt' : 'Menüyü genişlet'}>{expanded ? '‹' : '›'}</button></div><nav><section><p>HESAP</p>{account.map(renderItem)}</section><section><p>SOSYAL</p>{social.map(renderItem)}</section></nav><div className="sidebar-footer">{(expanded || mobileOpen) && <p>Kimliğin tek yerde.</p>}<button className="sidebar-logout" type="button" onClick={() => void handleLogout()} disabled={loggingOut}>{loggingOut ? 'Çıkılıyor…' : expanded || mobileOpen ? 'Çıkış yap' : '↪'}</button></div></aside>;
}
