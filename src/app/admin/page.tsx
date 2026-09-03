"use client";

import { useEffect, useState } from "react";
import { ApiError, request } from "@/lib/api";
import { PageLoader } from "@/components/page-loader";

export default function AdminPage() {
  const [counts, setCounts] = useState<{ users: number; logins: number; clients: number } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      request<{ pagination: { total: number } }>("/api/admin/users?pageSize=1"),
      request<{ pagination: { total: number } }>("/api/admin/login-history?pageSize=1"),
      request<{ clients: unknown[] }>("/api/admin/oauth-clients"),
    ])
      .then(([users, logins, clients]) =>
        setCounts({ users: users.pagination.total, logins: logins.pagination.total, clients: clients.clients.length }),
      )
      .catch((cause) => setError(cause instanceof ApiError ? cause.message : "Dashboard verileri yüklenemedi."));
  }, []);

  if (!counts && !error) return <PageLoader label="Yönetim verileri yükleniyor…" />;
  const cards = [
    ["Kullanıcılar", counts?.users, "/admin/users"],
    ["Login kayıtları", counts?.logins, "/admin/login-history"],
    ["OAuth clientleri", counts?.clients, "/admin/oauth-clients"],
  ] as const;
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-zinc-500">Yönetim</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Genel bakış</h1>
        <p className="mt-2 text-zinc-400">Zyqwax ID yönetim merkezine hoş geldin.</p>
      </header>
      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-red-300" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, count, href]) => (
          <a
            key={href}
            href={href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-600"
          >
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{count ?? "—"}</p>
            <p className="mt-4 text-sm text-zinc-400">Yönet →</p>
          </a>
        ))}
      </div>
    </div>
  );
}
