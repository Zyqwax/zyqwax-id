'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiError, verifyEmail } from '@/lib/api';

// URL'deki doğrulama token'ını otomatik tüketip sonucu gösterir.
function VerifyEmailContent() {
  const params = useSearchParams(); const requested = useRef(false); const [state, setState] = useState<'loading' | 'success' | 'error'>('loading'); const [message, setMessage] = useState('Email doğrulanıyor…');
  useEffect(() => {
    if (requested.current) return;
    requested.current = true; void Promise.resolve().then(() => { const token = params.get('token'); if (!token) { setState('error'); setMessage('Doğrulama tokenı bulunamadı.'); return; } return verifyEmail(token).then((result) => { setState('success'); setMessage(result.message); }).catch((cause) => { setState('error'); setMessage(cause instanceof ApiError ? cause.message : 'Email doğrulanamadı.'); }); }); }, [params]);
  return <div className="auth-panel"><div className="auth-box"><p className="eyebrow">Hesap doğrulama</p><h2>{state === 'success' ? 'Hazırsın.' : state === 'loading' ? 'Bir saniye.' : 'Link çalışmadı.'}</h2><p className="panel-intro">{message}</p><Link className="button button-primary button-wide" href="/login">Giriş yap</Link></div></div>;
}

// Email doğrulama sayfasını kart düzeninde ve Suspense sınırıyla sunar.
export default function VerifyEmailPage() { return <main className="auth-layout"><div className="auth-aside"><Link href="/" className="brand">✦ ZYQWAX ID</Link></div><Suspense fallback={<div className="auth-panel"><div className="loading-card">Yükleniyor…</div></div>}><VerifyEmailContent /></Suspense></main>; }
