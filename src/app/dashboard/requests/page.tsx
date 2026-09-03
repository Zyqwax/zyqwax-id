"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ApiError,
  cancelFriendRequest,
  fetchFriendRequests,
  respondToFriendRequest,
  sendFriendRequest,
  type FriendRequestItem,
} from "@/lib/api";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Check, Inbox, Send, UserPlus, X } from "lucide-react";
import { PageLoader } from "@/components/page-loader";

// Gelen ve gönderilen arkadaşlık isteklerini sekmeler ve aksiyonlarla yönetir.
export default function RequestsPage() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<FriendRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRequests((await fetchFriendRequests(tab)).requests);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "İstekler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function action(id: string, kind: "accept" | "decline" | "cancel") {
    setPending(id);
    setError("");
    try {
      if (kind === "cancel") await cancelFriendRequest(id);
      else await respondToFriendRequest(id, kind);
      setRequests((items) => items.filter((item) => item.id !== id));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "İstek güncellenemedi.");
    } finally {
      setPending(null);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    setSentMessage("");
    try {
      await sendFriendRequest(username.trim().toLowerCase());
      setUsername("");
      setSentMessage("Arkadaşlık isteği gönderildi.");
      if (tab === "sent") void load();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "İstek gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-12">
      <section aria-labelledby="requests-heading">
        <div className="mb-7">
          {/* <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Sosyal / Talepler</p> */}
          <h2 id="requests-heading" className="mt-1 text-lg font-medium text-zinc-100">
            İstekler
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Yeni bağlantıları gözden geçir.</p>
        </div>

        <form
          className="mb-6 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:flex-row sm:items-end"
          onSubmit={submit}
        >
          <div className="flex-1">
            <label htmlFor="request-username" className="text-sm font-medium text-zinc-300">
              Kullanıcı adı
            </label>
            <div className="mt-1 flex items-stretch overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 transition focus-within:border-zinc-400">
              <span className="flex select-none items-center border-r border-zinc-700 bg-zinc-800/80 px-3 text-sm text-zinc-400">
                @
              </span>
              <input
                id="request-username"
                className="h-10 w-full bg-transparent px-3 text-base text-white outline-none"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="kullanıcı_adı"
                required
              />
            </div>
          </div>
          <button
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 transition hover:bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            disabled={sending}
          >
            <UserPlus className="size-4" />
            {sending ? "Gönderiliyor…" : "İstek gönder"}
          </button>
        </form>

        {sentMessage && (
          <p className="mb-4 text-sm text-emerald-400" role="status">
            {sentMessage}
          </p>
        )}

        <div className="mb-5 inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
          <button
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition cursor-pointer ${
              tab === "received" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setTab("received")}
          >
            <Inbox className="size-4" />
            Gelen
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition cursor-pointer ${
              tab === "sent" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setTab("sent")}
          >
            <Send className="size-4" />
            Gönderilen
          </button>
        </div>

        {loading ? (
          <PageLoader label="İstekler yükleniyor…" />
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
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
            {tab === "received" ? (
              <Inbox className="size-8 text-zinc-600" strokeWidth={1.5} />
            ) : (
              <Send className="size-8 text-zinc-600" strokeWidth={1.5} />
            )}
            <p className="text-sm text-zinc-500">Bu sekmede istek yok.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
            {requests.map((request, index) => {
              const isPending = pending === request.id;
              return (
                <div
                  key={request.id}
                  className={`flex items-center justify-between gap-4 p-5 ${
                    index !== requests.length - 1 ? "border-b border-zinc-800" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <UserAvatar
                      size={44}
                      src={request.user.avatarUrl}
                      username={request.user.username}
                      name={request.user.name}
                      className=""
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {request.user.name || request.user.username || "İsimsiz kullanıcı"}
                      </p>
                      {request.user.username && (
                        <p className="truncate text-sm text-zinc-500">@{request.user.username}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {tab === "received" ? (
                      <>
                        <button
                          className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isPending}
                          onClick={() => void action(request.id, "accept")}
                        >
                          <Check className="size-4" />
                          Kabul et
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isPending}
                          onClick={() => void action(request.id, "decline")}
                        >
                          <X className="size-4" />
                          Reddet
                        </button>
                      </>
                    ) : (
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isPending}
                        onClick={() => void action(request.id, "cancel")}
                      >
                        {isPending ? "…" : "İptal et"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
