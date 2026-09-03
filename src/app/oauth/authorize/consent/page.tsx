import Link from "next/link";
import { getConsentRequest, OAUTH_SCOPE_LABELS } from "@/lib/server/oauth-service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yetkilendirme onayı" };

type Props = { searchParams: Promise<{ request?: string | string[] }> };

export default async function ConsentPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawToken = Array.isArray(params.request) ? params.request[0] : params.request;
  const consent = rawToken ? await getConsentRequest(rawToken).catch(() => null) : null;

  if (!consent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
        <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-7">
          <p className="text-sm text-red-400">Bu yetkilendirme isteği geçersiz veya süresi dolmuş.</p>
          <Link href="/" className="mt-5 inline-block text-sm text-zinc-300 hover:text-white">
            Ana sayfaya dön
          </Link>
        </section>
      </main>
    );
  }

  const scopes = consent.scope.split(" ");
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-7 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Zyqwax ID</p>
        <h1 className="mt-4 text-2xl font-semibold">{consent.app.name} erişim istiyor</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {consent.user.email} hesabınla devam edersen bu uygulama aşağıdaki bilgilere erişebilecek:
        </p>
        <ul className="mt-6 space-y-3">
          {scopes.map((scope) => (
            <li
              key={scope}
              className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-200"
            >
              <span className="text-amber-400">✓</span>
              <span>{OAUTH_SCOPE_LABELS[scope] ?? scope}</span>
            </li>
          ))}
        </ul>
        <form action="/api/oauth/authorize/consent" method="post" className="mt-7 grid grid-cols-2 gap-3">
          <input type="hidden" name="request" value={rawToken} />
          <button
            name="action"
            value="deny"
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            İptal
          </button>
          <button
            name="action"
            value="approve"
            className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white"
          >
            Yetkilendir
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-zinc-500">Bu isteği beklemiyorsan iptal et.</p>
      </section>
    </main>
  );
}
