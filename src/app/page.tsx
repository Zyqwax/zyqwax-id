import Link from "next/link";
import { PublicRoute } from "@/components/public-route";

export default function Home() {
  return (
    <PublicRoute><main className="landing page-shell">
      <div className="landing-mark">
        <span aria-hidden="true">✦</span> ZYQWAX ID
      </div>
      <section className="landing-content">
        <p className="eyebrow">Kimliğin, sadeleşmiş</p>
        <h1>
          Her bağlantıda
          <br />
          <em>sen.</em>
        </h1>
        <p className="landing-copy">
          Tek bir güvenli hesapla Zyqwax deneyimine devam et. Parolanın
          ötesinde, kontrol sende.
        </p>
        <div className="landing-actions">
          <Link className="button button-primary" href="/login">
            Giriş yap <span aria-hidden="true">↗</span>
          </Link>
          <Link className="text-link" href="/register">
            Yeni hesap oluştur
          </Link>
          <div>
            {process.env.NODE_ENV === "development" ? (
              <p className="text-sm text-muted-foreground">
                Development mode active
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Production mode active
              </p>
            )}
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <span>Kimlik katmanı / 01</span>
        <span>Güvenli oturum</span>
      </footer>
    </main></PublicRoute>
  );
}
