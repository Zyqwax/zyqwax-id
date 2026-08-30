# Zyqwax ID — Next.js full-stack

Zyqwax ID artık UI ve backend API route'larını aynı Next.js App Router uygulamasında barındırır. `backend/` klasörü silinmemiştir; mevcut Express uygulaması, Prisma kaynağı ve migration geçmişi geriye dönük uyumluluk/rollback için korunur. Vercel projesinin root'u `zyqwax-auth` olmalıdır.

## Geliştirme ve doğrulama

Yalnızca pnpm kullanılır:

```text
Install: pnpm install
Development: pnpm dev
Production build: pnpm build
Production start: pnpm start
```

Build önce `prisma generate`, sonra `next build` çalıştırır. Yerel API route'larını çalıştırmak için `.env.example` içindeki server-only değişkenleri `.env.local` içine gerçek yerel değerlerle doldurun. `.env.local` git'e gönderilmez.

## API route'ları

Native Next route handler'lar şu endpoint'leri sağlar:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/oauth/authorize`
- `POST /api/oauth/token` (JSON veya form-urlencoded)
- `GET /api/oauth/userinfo`
- `GET /api/health`

İstemci API wrapper'ı artık external API URL kullanmaz; relative `/api` yollarını kullanır. Frontend ve API aynı origin olduğu için refresh cookie browser refresh sonrasında da gönderilir.

## Auth güvenliği

- Access token yalnızca React/module memory'de tutulur; localStorage, sessionStorage, URL veya normal cookie kullanılmaz.
- Refresh token yalnızca `HttpOnly` cookie'dedir. Native API cookie'si production'da `Secure`, `SameSite=Lax` ve `/api/auth` path'i ile yazılır.
- `/auth/refresh` rotation işlemi Prisma transaction içindedir.
- Client 401 sonrası tek bir shared refresh promise kullanır ve orijinal isteği yalnızca bir kez tekrarlar.
- Parolalar bcrypt ile hash'lenir; veritabanında refresh token özeti tutulur.
- Generic hata yanıtları credential içermez; route handler'lar secret/token loglamaz.
- Tüm API route'ları Prisma/bcrypt/jsonwebtoken nedeniyle Node.js runtime olarak çalışır; Edge runtime kullanılmaz.

## Prisma ve Vercel

`backend/prisma/schema.prisma` ve migration'ların deploy root'u için birebir kopyası `zyqwax-auth/prisma/` altında tutulur. İki schema'yı birlikte güncel tutun. Production migration'ı request handler içinde veya her build'de çalıştırmayın; kontrollü release adımı olarak şu komutla, production database'e karşı bir kez uygulayın:

```text
pnpm prisma migrate deploy --schema prisma/schema.prisma
```

Vercel Environment Variables içine server-only olarak şunları ekleyin:

```text
DATABASE_URL=<pooled production PostgreSQL connection>
JWT_ACCESS_SECRET=<random secret, minimum 32 characters>
JWT_REFRESH_SECRET=<different random secret, minimum 32 characters>
NODE_ENV=production
OAUTH_LOGIN_URL=https://<your-domain>/login
```

`DATABASE_URL` için Neon/Vercel Postgres gibi pooled bağlantı kullanın. JWT secret, database URL, OAuth client secret veya başka credential'ları `NEXT_PUBLIC_` ile başlayan değişkenlere koymayın.

## Rate limit sınırı

`src/lib/server/rate-limit.ts` şu anda sınırlı bir in-memory warm-instance adapter kullanır. Bu Vercel function instance'ları arasında paylaşılmaz ve yüksek riskli production trafiği için yeterli değildir. Production cutover'dan önce aynı arayüzü Upstash Redis/Vercel KV gibi dağıtık bir store ile değiştirmek gerekir.

## OAuth2 / PKCE

OAuth endpoint'leri authorization code + PKCE S256, exact registered redirect URI, kısa ömürlü tek kullanımlık code ve constant-time challenge karşılaştırmasını korur. Token endpoint client secret'ı server-side karşılaştırır.

`/oauth/authorize` Bearer access token sözleşmesini korur. Access token'ı query/hash'e koyan bir browser bypass uygulanmamıştır. Native same-origin bir OAuth client akışı eklenecekse `state` ve `code_verifier` server-side, kısa ömürlü bir continuation/session ile bağlanmalı; client secret browser bundle'ına girmemelidir.

## Vercel geçişi

- Vercel project root: `zyqwax-auth`
- Build command: `pnpm build`
- Install command: `pnpm install`
- Production domain'i `OAUTH_LOGIN_URL` içinde kullanın.
- Prisma migration'ı deploy öncesi kontrollü release/database adımı olarak uygulayın.
- `backend/` Express uygulaması bu migration sırasında silinmez; geçiş doğrulanana kadar rollback referansı olarak korunur.
- Deploy, GitHub push veya Vercel panel değişikliği bu çalışma kapsamında yapılmadı.
