import Link from 'next/link';

export default function Home() {
  return <main className="landing page-shell"><div className="landing-mark"><span aria-hidden="true">✦</span> ZYQWAX ID</div><section className="landing-content"><p className="eyebrow">Kimliğin, sadeleşmiş</p><h1>Her bağlantıda<br /><em>sen.</em></h1><p className="landing-copy">Tek bir güvenli hesapla Zyqwax deneyimine devam et. Parolanın ötesinde, kontrol sende.</p><div className="landing-actions"><Link className="button button-primary" href="/login">Giriş yap <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/register">Yeni hesap oluştur</Link></div></section><footer className="landing-footer"><span>Kimlik katmanı / 01</span><span>Güvenli oturum</span></footer></main>;
}
