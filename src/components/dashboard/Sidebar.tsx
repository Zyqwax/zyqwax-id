'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchReceivedRequestCount } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

// Dashboard bölümlerini ve bekleyen istek sayısını sabit sol navigasyonda gösterir.
export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => { fetchReceivedRequestCount().then(setRequestCount).catch(() => setRequestCount(0)); }, [pathname]);
  const account = [{ href: '/dashboard', label: 'Profil', icon: '□' }];
  const social = [{ href: '/dashboard/friends', label: 'Arkadaşlar', icon: '◇' }, { href: '/dashboard/requests', label: 'İstekler', icon: '↔' }, { href: '/dashboard/blocked', label: 'Engellenenler', icon: '⊘' }];
  async function handleLogout() { setLoggingOut(true); try { await logout(); } finally { setLoggingOut(false); } }
  const renderItem = ({ href, label, icon }: { href: string; label: string; icon: string }) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className={`flex items-center gap-2 rounded-[7px] px-2 py-1.5 text-[13px] ${pathname === href ? 'bg-bg-elevated-hover text-text-primary' : 'text-text-tertiary'}`}><span aria-hidden="true" className="text-text-muted">{icon}</span><span className="flex-1">{label}</span>{href === '/dashboard/requests' && requestCount > 0 && <span className="rounded-[9px] bg-accent-danger-bg px-1.5 py-px text-[10px] text-accent-danger-text">{requestCount}</span>}</Link>;
  return <aside className="dashboard-shell-sidebar flex w-[220px] shrink-0 flex-col border-r border-border-default bg-bg-canvas px-3.5 py-5"><Link href="/dashboard" className="mb-6 flex items-center gap-2 px-1 text-[13px] font-medium text-text-primary"><span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-text-primary text-xs font-medium text-bg-surface">Z</span>Zyqwax ID</Link><nav className="space-y-5"><section><p className="mb-2 px-2 text-[10px] tracking-[.06em] text-text-faint">HESAP</p>{account.map(renderItem)}</section><section><p className="mb-2 px-2 text-[10px] tracking-[.06em] text-text-faint">SOSYAL</p>{social.map(renderItem)}</section></nav><div className="mt-auto rounded-[10px] border border-border-default bg-bg-surface p-3 text-xs text-text-muted"><p>Kimliğin tek yerde, kontrolün sende.</p><button className="sidebar-logout" type="button" onClick={() => void handleLogout()} disabled={loggingOut}>{loggingOut ? 'Çıkılıyor…' : 'Çıkış yap'}</button></div></aside>;
}
