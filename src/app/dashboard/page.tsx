'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { UserProfile } from '@/components/user-profile';
import { useAuth } from '@/components/auth-provider';
import { ApiError } from '@/lib/api';

export default function DashboardPage() {
  const { logout } = useAuth();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function handleLogout() {
    setPending(true); setError('');
    try { await logout(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Çıkış yapılamadı.'); }
    finally { setPending(false); }
  }
  return <ProtectedRoute><main className="dashboard page-shell"><header className="dashboard-header"><Link href="/" className="brand"><span aria-hidden="true">✦</span> ZYQWAX ID</Link><button className="button button-quiet" onClick={handleLogout} disabled={pending}>{pending ? 'Çıkılıyor…' : 'Çıkış yap'}</button></header><section className="dashboard-hero"><div><p className="eyebrow">Kontrol merkezi</p><h1>Hoş geldin<br /><em>içeri.</em></h1><p className="dashboard-copy">Hesabın hazır. Buradan kimlik bilgilerini ve oturumunu takip edebilirsin.</p></div><div className="signal" aria-label="Oturum güvende"><span className="signal-ring"><span>✓</span></span><p>Oturum<br /><strong>güvende</strong></p></div></section>{error && <p className="form-error dashboard-error" role="alert">{error}</p>}<UserProfile /><section className="info-grid"><article><p className="eyebrow">Durum</p><h3>Her şey yolunda.</h3><p className="muted">Kimliğin doğrulandı ve oturumun aktif.</p></article><article><p className="eyebrow">Koruma</p><h3>Token bellekte.</h3><p className="muted">Erişim anahtarın tarayıcı depolamasına yazılmaz.</p></article></section><footer className="dashboard-footer">Zyqwax ID <span>·</span> Senin kontrolünde</footer></main></ProtectedRoute>;
}
