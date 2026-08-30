'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ApiError, forgotPassword } from '@/lib/api';

// Parola sıfırlama emaili isteyen ortalanmış formu yönetir.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setPending(true); setError(''); try { setMessage((await forgotPassword(email)).message); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'İstek gönderilemedi.'); } finally { setPending(false); } }
  return <main className="auth-layout"><div className="auth-aside"><Link href="/" className="brand">✦ ZYQWAX ID</Link></div><div className="auth-panel"><div className="auth-box"><p className="eyebrow">Hesap erişimi</p><h2>Şifremi unuttum</h2><p className="panel-intro">Email adresini yaz; varsa sıfırlama bağlantısını gönderelim.</p>{message ? <div className="panel-intro" role="status">{message}</div> : <form className="auth-form" onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="sen@ornek.com" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary button-wide" disabled={pending}>{pending ? 'Gönderiliyor…' : 'Sıfırlama emaili gönder'}</button></form>}<p className="form-switch"><Link href="/login">Girişe dön</Link></p></div></div></main>;
}
