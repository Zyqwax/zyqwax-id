'use client';

import { useAuth } from './auth-provider';

export function UserProfile() {
  const { user } = useAuth();
  if (!user) return null;
  const initials = (user.name || user.email).slice(0, 1).toUpperCase();
  return <section className="profile-card" aria-labelledby="profile-heading">
    <div className="avatar" aria-hidden="true">{initials}</div>
    <div><p className="eyebrow">Aktif profil</p><h2 id="profile-heading">{user.name || 'Zyqwax kullanıcısı'}</h2><p className="muted">{user.email}</p></div>
    <span className="status-pill"><span aria-hidden="true">●</span> Güvenli</span>
  </section>;
}
