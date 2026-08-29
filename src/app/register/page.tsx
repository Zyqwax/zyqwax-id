import Link from 'next/link';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export const metadata = { title: 'Kayıt ol' };

export default function RegisterPage() {
  return <main className="auth-layout"><div className="auth-aside"><Link href="/" className="brand"><span aria-hidden="true">✦</span> ZYQWAX ID</Link><div className="aside-message"><p className="eyebrow">Yeni bir başlangıç</p><h1>Alanını<br /><em>aç.</em></h1><p>Zyqwax dünyasına kendi kimliğinle katıl.</p></div><span className="aside-meta">Bir hesap. Daha az sürtünme.</span></div><div className="auth-panel"><div className="auth-box"><div className="mobile-brand"><Link href="/" className="brand"><span aria-hidden="true">✦</span> ZYQWAX ID</Link></div><p className="eyebrow">Bugün başla</p><h2>Hesap oluştur</h2><p className="panel-intro">Sadece gerekli bilgiler. Sonra gerisi kolay.</p><Suspense fallback={<div className="loading-card" role="status">Form yükleniyor…</div>}><AuthForm mode="register" /></Suspense></div></div></main>;
}
