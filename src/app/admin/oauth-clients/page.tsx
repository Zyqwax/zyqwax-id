"use client";
import { useCallback, useEffect, useState } from "react";
import { ApiError, request } from "@/lib/api";
import { PageLoader } from "@/components/page-loader";
type Client = {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  allowedOrigins: string[];
  createdAt: string;
  owner: { id: string; username: string; name: string | null; email: string } | null;
};
type Form = { name: string; redirectUris: string; allowedOrigins: string };
const blank: Form = { name: "", redirectUris: "", allowedOrigins: "" };
const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
export default function OAuthClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(async () => {
    try {
      setClients((await request<{ clients: Client[] }>("/api/admin/oauth-clients")).clients);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "OAuth clientleri yüklenemedi.");
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  function edit(client: Client) {
    setEditing(client.id);
    setForm({
      name: client.name,
      redirectUris: client.redirectUris.join("\n"),
      allowedOrigins: client.allowedOrigins.join("\n"),
    });
    setSecret("");
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const body = {
        name: form.name,
        redirectUris: lines(form.redirectUris),
        allowedOrigins: lines(form.allowedOrigins),
      };
      if (editing)
        await request(`/api/admin/oauth-clients/${editing}`, { method: "PATCH", body: JSON.stringify(body) });
      else {
        const result = await request<{ clientSecret: string }>("/api/admin/oauth-clients", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setSecret(result.clientSecret);
      }
      setEditing(null);
      setForm(blank);
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Client kaydedilemedi.");
    }
  }
  async function remove(client: Client) {
    if (!window.confirm(`${client.name} clientini ve bağlı oturumlarını silmek istiyor musun?`)) return;
    try {
      await request(`/api/admin/oauth-clients/${client.id}`, { method: "DELETE" });
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Client silinemedi.");
    }
  }
  if (!loaded && !error) return <PageLoader label="OAuth clientleri yükleniyor…" />;
  return (
    <section className="space-y-5">
      <header>
        <p className="text-sm text-zinc-500">Yönetim</p>
        <h1 className="mt-1 text-3xl font-semibold">OAuth clientleri</h1>
      </header>
      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-red-300" role="alert">
          {error}
        </p>
      )}
      {secret && (
        <div className="rounded-lg border border-amber-700 bg-amber-950/40 p-4 text-sm text-amber-200">
          <p className="font-semibold">Client secret — yalnızca şimdi gösterilir</p>
          <code className="mt-2 block break-all select-all">{secret}</code>
        </div>
      )}
      <form onSubmit={save} className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 md:grid-cols-2">
        <input
          className="rounded-lg border border-zinc-700 bg-zinc-950 p-3"
          placeholder="Client adı"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="rounded-lg border border-zinc-700 bg-zinc-950 p-3"
          placeholder="Redirect URI — satır başına bir tane"
          value={form.redirectUris}
          onChange={(e) => setForm({ ...form, redirectUris: e.target.value })}
          required
        />
        <textarea
          className="rounded-lg border border-zinc-700 bg-zinc-950 p-3"
          placeholder="Allowed origin — satır başına bir tane"
          value={form.allowedOrigins}
          onChange={(e) => setForm({ ...form, allowedOrigins: e.target.value })}
        />
        <div className="flex gap-2">
          <button className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900">
            {editing ? "Güncelle" : "Client oluştur"}
          </button>
          {editing && (
            <button
              type="button"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
              onClick={() => {
                setEditing(null);
                setForm(blank);
              }}
            >
              İptal
            </button>
          )}
        </div>
      </form>
      <div className="space-y-3">
        {clients.map((client) => (
          <article key={client.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="font-semibold">{client.name}</h2>
                <code className="text-xs text-zinc-500">{client.clientId}</code>
                <p className="mt-2 text-xs text-zinc-300">
                  Owner: {client.owner ? `${client.owner.username} (${client.owner.email})` : "Sahipsiz"}
                </p>
                <p className="mt-3 text-xs text-zinc-400">Redirect: {client.redirectUris.join(", ")}</p>
                <p className="text-xs text-zinc-400">Origin: {client.allowedOrigins.join(", ") || "—"}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-zinc-700 px-3 py-2 text-sm" onClick={() => edit(client)}>
                  Düzenle
                </button>
                <button
                  className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300"
                  onClick={() => void remove(client)}
                >
                  Sil
                </button>
              </div>
            </div>
          </article>
        ))}
        {!clients.length && <p className="text-zinc-500">OAuth clienti yok.</p>}
      </div>
    </section>
  );
}
