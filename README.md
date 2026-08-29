# Zyqwax ID frontend

Next.js App Router ile Zyqwax ID backend API'sine bağlanan, access token'ı yalnızca bellekte tutan frontend.

## Geliştirme

Backend'i `http://localhost:3000`, frontend'i `http://localhost:3001` üzerinde çalıştırmak için:

```text
Install: pnpm install
Development: pnpm dev
Production build: pnpm build
Production start: pnpm start
```

`NEXT_PUBLIC_API_URL` public bir API adresidir; secret değildir. `.env.local` yerel makinede tutulur ve git'e gönderilmez. `.env.example` yalnızca placeholder içerir. Client secret, JWT secret, database URL veya başka bir credential'ı `NEXT_PUBLIC_` değişkenine koymayın.

## Auth mimarisi

- `AuthProvider`, access token'ı React state ve module memory store'da tutar. `localStorage`, `sessionStorage`, URL veya normal cookie kullanılmaz.
- Uygulama açılışında tek bir shared bootstrap promise ile `/auth/refresh` çağrılır; başarılı refresh sonrası `/auth/me` ile güvenli kullanıcı profili yüklenir.
- Refresh cookie'si backend'in HttpOnly `refreshToken` cookie'sidir. `/auth/register`, `/auth/login`, `/auth/refresh` ve `/auth/logout` çağrıları `credentials: 'include'` gönderir.
- API wrapper bir 401 için tek bir retry yapar. Aynı anda gelen 401'ler tek bir in-flight refresh promise'ini paylaşır; refresh başarısızsa memory session temizlenir ve kullanıcı login'e yönlendirilir.
- `/dashboard` client-side `ProtectedRoute` ile korunur. Backend cookie'si Render domain'inde, frontend Vercel domain'inde olduğu için middleware cookie'yi okuyamaz.
- Backend'in generic `error` yanıtları kullanıcıya gösterilir; token, parola ve secret loglanmaz.

## OAuth2 / PKCE değerlendirmesi

Backend `/oauth/authorize` endpoint'i Bearer access token ister. Normal bir `window.location` navigasyonu Authorization header taşımaz; ayrıca access token'ı query veya hash'e eklemek token sızıntısı olur. Bu nedenle bu frontend OAuth continuation'ı güvensiz bir bypass gibi uygulamaz ve OAuth client/callback akışını “tamamlandı” olarak sunmaz.

Backend mevcut davranışında oturum yoksa authorize sorgusunu `OAUTH_LOGIN_URL` üzerindeki `/login?redirect=...` adresine taşır. Bu UI yalnızca aynı-origin, `/` ile başlayan ve `//` ile başlamayan `next` değerlerine yönlendirir; keyfi redirect kabul etmez. OAuth continuation için güvenli bir sonraki tasarım:

1. Ayrı bir OAuth client kaydı, exact registered redirect URI ve public client için PKCE üretimi.
2. `code_verifier` ve `state` değerlerinin kısa ömürlü, tab/session akışına bağlı güvenli saklanması.
3. Authorization header gerektiren authorize çağrısı için server-side BFF/route handler veya backend'in güvenli browser redirect akışını desteklemesi.
4. Secret gerektiren `/oauth/token` exchange işleminin browser bundle'ına girmeden server-side yapılması.

Bu blocker çözülmeden access token'ı URL'ye koymayın, state/PKCE doğrulamasını kapatmayın ve demo bypass kullanmayın.

## Vercel + Render ayarları

Vercel Project Settings → Environment Variables altında Preview ve Production için ayrı ayrı:

```text
NEXT_PUBLIC_API_URL=https://<zyqwax-id-backend>.onrender.com
```

Gerçek Render URL'sini placeholder yerine girin. Bu değer değişince yeniden deploy gerekir. Backend Render ayarlarında `ALLOWED_ORIGINS` içine gerçek Vercel origin'ini (`https://...vercel.app`) ekleyin; gerekirse Preview domain'ini de ayrıca ekleyin. Backend CORS `credentials: true` kullandığı için wildcard `*` origin kullanmayın.

Render cold start/uyku sonrası ilk istek gecikebilir; ekranlarda loading state ve ağ timeout/error mesajı bulunur. Gerçek secret'ları frontend env'ine, `.env.example` dosyasına veya git'e yazmayın. Deploy ve GitHub push bu çalışma kapsamında yapılmadı.
