'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ApiError, resetPassword } from '@/lib/api';

// URL token'ı ve yeni parola alanlarını yönetir.
function ResetPasswordContent() {
  const params = useSearchParams(); const router = useRouter(); const token = params.get('token') ?? ''; const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); if (password !== confirmation) { setError('Şifreler eşleşmiyor.'); return; } setPending(true); setError(''); try { await resetPassword(token, password); router.replace('/login?reset=success'); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Şifre sıfırlanamadı.'); } finally { setPending(false); } }
  return <div className="auth-panel"><div className="auth-box"><p className="eyebrow">Hesap erişimi</p><h2>Yeni şifre</h2><p className="panel-intro">Hesabın için yeni bir şifre belirle.</p>{!token ? <p className="form-error">Sıfırlama tokenı bulunamadı.</p> : <form className="auth-form" onSubmit={submit}><label>Yeni şifre<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label><label>Yeni şifre tekrar<input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary button-wide" disabled={pending}>{pending ? 'Kaydediliyor…' : 'Şifreyi güncelle'}</button></form>}<p className="form-switch"><Link href="/login">Girişe dön</Link></p></div></div>;
}

// Parola sıfırlama sayfasını güvenli Suspense sınırıyla sunar.
export default function ResetPasswordPage() { return <main className="auth-layout"><div className="auth-aside"><Link href="/" className="brand">✦ ZYQWAX ID</Link></div><Suspense fallback={<div className="auth-panel"><div className="loading-card">Yükleniyor…</div></div>}><ResetPasswordContent /></Suspense></main>; }
