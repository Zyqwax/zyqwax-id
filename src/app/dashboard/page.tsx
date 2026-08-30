'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, fetchMe, resendVerification } from '@/lib/api';
import type { SafeUser } from '@/lib/types';
import { ListRow } from '@/components/ui/ListRow';
import { CooldownBadge } from '@/components/ui/CooldownBadge';
import { AvatarEditorModal } from '@/components/dashboard/AvatarEditorModal';
import { EditEmailModal } from '@/components/dashboard/EditEmailModal';
import { EditNameModal } from '@/components/dashboard/EditNameModal';
import { EditUsernameModal } from '@/components/dashboard/EditUsernameModal';

type ModalName = 'avatar' | 'email' | 'name' | 'username' | null;

function cooldownDate(value: string | null | undefined, days: number) {
  if (!value) return null;
  const date = new Date(value); date.setDate(date.getDate() + days); return date > new Date() ? date : null;
}

// Kullanıcı profilini, alan düzenleme satırlarını ve ilgili modal akışlarını yönetir.
export default function DashboardPage() {
  const [user, setUser] = useState<SafeUser | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [modal, setModal] = useState<ModalName>(null); const [resending, setResending] = useState(false); const [verificationMessage, setVerificationMessage] = useState('');
  const loadProfile = useCallback(async () => { setLoading(true); setError(''); try { setUser((await fetchMe()).user); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Profil yüklenemedi.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void Promise.resolve().then(loadProfile); }, [loadProfile]);
  const usernameCooldown = useMemo(() => cooldownDate(user?.usernameChangedAt, 7), [user?.usernameChangedAt]);
  const emailCooldown = useMemo(() => cooldownDate(user?.emailChangedAt, 7), [user?.emailChangedAt]);
  const nameCooldown = useMemo(() => cooldownDate(user?.nameChangedAt, 1), [user?.nameChangedAt]);
  if (loading) return <div className="dashboard-content"><div className="loading-card">Profil yükleniyor…</div></div>;
  if (error || !user) return <div className="dashboard-content"><div className="panel-error" role="alert">{error || 'Profil bulunamadı.'}<button className="button-secondary mt-4" onClick={() => void loadProfile()}>Tekrar dene</button></div></div>;
  const save = (next: SafeUser) => { setUser(next); setModal(null); };
  async function resend() { setResending(true); setVerificationMessage(''); try { setVerificationMessage((await resendVerification()).message); } catch (cause) { setVerificationMessage(cause instanceof ApiError ? cause.message : 'Email gönderilemedi.'); } finally { setResending(false); } }
  return <div className="dashboard-content"><header className="content-header"><div><p className="section-kicker">HESAP / PROFİL</p><h1>Profil</h1><p className="content-intro">Kimlik bilgilerini tek yerden yönet.</p></div></header>{user.emailVerified === false && <div className="verification-warning" role="status">Email adresin henüz doğrulanmadı. <button onClick={() => void resend()} disabled={resending}>{resending ? 'Gönderiliyor…' : 'Doğrulama emailini tekrar gönder'}</button>{verificationMessage && <span> {verificationMessage}</span>}</div>}<section className="profile-summary"><div className="profile-avatar">{user.avatarUrl || user.avatar ? <img src={user.avatarUrl || user.avatar || ''} alt="" /> : (user.name || user.username || user.email).slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><h2>{user.name || user.username || 'İsimsiz kullanıcı'}</h2><p>@{user.username || 'kullanıcı'}</p></div><button className="button-secondary" onClick={() => setModal('avatar')}>Değiştir</button></section><section className="content-section"><div className="section-heading"><h2>Profil bilgileri</h2><p>Değişiklikler hesabındaki kimlik bilgilerine yansır.</p></div><div className="list-stack"><ListRow title="Kullanıcı adı" subtitle={user.username || 'Belirlenmemiş'} actions={<><CooldownBadge nextAllowedAt={usernameCooldown} /><button className="button-secondary" onClick={() => setModal('username')}>Düzenle</button></>} /><ListRow title="E-posta" subtitle={user.email} actions={<><CooldownBadge nextAllowedAt={emailCooldown} /><button className="button-secondary" onClick={() => setModal('email')}>Düzenle</button></>} /><ListRow title="İsim" subtitle={user.name || 'Belirlenmemiş'} actions={<><CooldownBadge nextAllowedAt={nameCooldown} /><button className="button-secondary" onClick={() => setModal('name')}>Düzenle</button></>} /></div></section>{modal === 'avatar' && <AvatarEditorModal user={user} onClose={() => setModal(null)} onSaved={save} />}{modal === 'username' && <EditUsernameModal user={user} onClose={() => setModal(null)} onSaved={save} />}{modal === 'email' && <EditEmailModal user={user} onClose={() => setModal(null)} onSaved={save} />}{modal === 'name' && <EditNameModal user={user} onClose={() => setModal(null)} onSaved={save} />}</div>;
}
