"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, fetchBlocked, unblockUser, type FriendListItem } from "@/lib/api";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ShieldOff, UserX } from "lucide-react";
import { PageLoader } from "@/components/page-loader";

type BlockedItem = { id: string; createdAt: string; user: FriendListItem };

// Engellenen kullanıcıları listeler ve engel kaldırma işlemini API üzerinden yürütür.
export default function BlockedPage() {
  const [blocked, setBlocked] = useState<BlockedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBlocked((await fetchBlocked()).blocked as BlockedItem[]);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Engellenenler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function unblock(id: string) {
    setPending(id);
    setError("");
    try {
      await unblockUser(id);
      setBlocked((items) => items.filter((item) => item.user.id !== id));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Engel kaldırılamadı.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-12">
      <section aria-labelledby="blocked-heading">
        <div className="mb-7">
          {/* <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Sosyal / Gizlilik</p> */}
          <h2 id="blocked-heading" className="mt-1 text-lg font-medium text-zinc-100">
            Engellenenler
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Görmek istemediğin hesapları yönet.</p>
        </div>

        {loading ? (
          <PageLoader label="Engellenenler yükleniyor…" />
        ) : error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-8 text-red-300" role="alert">
            {error}
            <button
              className="mt-5 block rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 transition hover:bg-white cursor-pointer"
              onClick={() => void load()}
            >
              Tekrar dene
            </button>
          </div>
        ) : blocked.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
            <ShieldOff className="size-8 text-zinc-600" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">Engellenen kullanıcı yok.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
            {blocked.map((item, index) => {
              const isPending = pending === item.user.id;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-4 p-5 ${
                    index !== blocked.length - 1 ? "border-b border-zinc-800" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <UserAvatar
                      size={44}
                      src={item.user.avatarUrl}
                      username={item.user.username}
                      name={item.user.name}
                      className="grayscale"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {item.user.name || item.user.username || "İsimsiz kullanıcı"}
                      </p>
                      {item.user.username && (
                        <p className="truncate text-sm text-zinc-500">@{item.user.username}</p>
                      )}
                    </div>
                  </div>

                  <button
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isPending}
                    onClick={() => void unblock(item.user.id)}
                  >
                    <UserX className="size-4" />
                    {isPending ? "Kaldırılıyor…" : "Engeli kaldır"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
