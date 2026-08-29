import Link from 'next/link';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export const metadata = { title: 'Giriş yap' };

export default function LoginPage() {
  return <main className="auth-layout"><div className="auth-aside"><Link href="/" className="brand"><span aria-hidden="true">✦</span> ZYQWAX ID</Link><div className="aside-message"><p className="eyebrow">Güvenli alan</p><h1>İyi ki<br /><em>geldin.</em></h1><p>Hesabına erişmek için kısa bir adım.</p></div><span className="aside-meta">Oturumlarını tek yerde tut.</span></div><div className="auth-panel"><div className="auth-box"><div className="mobile-brand"><Link href="/" className="brand"><span aria-hidden="true">✦</span> ZYQWAX ID</Link></div><p className="eyebrow">Hesabına dön</p><h2>Giriş yap</h2><p className="panel-intro">Devam etmek için bilgilerini gir.</p><Suspense fallback={<div className="loading-card" role="status">Form yükleniyor…</div>}><AuthForm mode="login" /></Suspense></div></div></main>;
}
