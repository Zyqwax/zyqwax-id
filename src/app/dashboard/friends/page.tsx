"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ApiError,
  cancelFriendRequest,
  fetchFriendRequests,
  fetchFriends,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
  type FriendListItem,
  type FriendRequestItem,
} from "@/lib/api";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Check, Inbox, Send, UserPlus, UserRoundX, Users, X } from "lucide-react";

type Tab = "friends" | "received" | "sent";

// Arkadaşlar, gelen ve gönderilen istekleri tek ekranda sekmeli olarak yönetir.
export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("friends");

  const [friends, setFriends] = useState<FriendListItem[] | null>(null);
  const [received, setReceived] = useState<FriendRequestItem[] | null>(null);
  const [sent, setSent] = useState<FriendRequestItem[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const load = useCallback(async (target: Tab) => {
    setLoading(true);
    setError("");
    try {
      if (target === "friends") setFriends((await fetchFriends()).friends);
      else if (target === "received") setReceived((await fetchFriendRequests("received")).requests);
      else setSent((await fetchFriendRequests("sent")).requests);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasData = tab === "friends" ? friends : tab === "received" ? received : sent;
    if (hasData === null) void load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function removeFriendRow(friend: FriendListItem) {
    if (!window.confirm(`${friend.name || friend.username || "Bu kullanıcı"} arkadaşlıktan çıkarılsın mı?`)) return;
    setPending(friend.id);
    setError("");
    try {
      await removeFriend(friend.id);
      setFriends((items) => (items ? items.filter((item) => item.id !== friend.id) : items));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Arkadaş kaldırılamadı.");
    } finally {
      setPending(null);
    }
  }

  async function requestAction(id: string, kind: "accept" | "decline" | "cancel") {
    setPending(id);
    setError("");
    try {
      if (kind === "cancel") await cancelFriendRequest(id);
      else await respondToFriendRequest(id, kind);
      if (kind === "cancel") setSent((items) => (items ? items.filter((item) => item.id !== id) : items));
      else setReceived((items) => (items ? items.filter((item) => item.id !== id) : items));
      // Kabul edilen istek arkadaş listesine eklenmiş olabilir; sekmeye geçildiğinde tazelensin.
      if (kind === "accept") setFriends(null);
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
      setSent(null);
      if (tab === "sent") void load("sent");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "İstek gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  const currentList = tab === "friends" ? friends : tab === "received" ? received : sent;
  const emptyMessage =
    tab === "friends" ? "Henüz arkadaşın yok." : tab === "received" ? "Bekleyen gelen istek yok." : "Bekleyen gönderilen istek yok.";
  const emptyIcon =
    tab === "friends" ? <Users className="size-8 text-zinc-600" strokeWidth={1.5} /> : tab === "received" ? (
      <Inbox className="size-8 text-zinc-600" strokeWidth={1.5} />
    ) : (
      <Send className="size-8 text-zinc-600" strokeWidth={1.5} />
    );

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-12">
      <section aria-labelledby="friends-heading">
        <div className="mb-7">
          <h2 id="friends-heading" className="mt-1 text-lg font-medium text-zinc-100">
            Arkadaşlar
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Bağlantılarını yönet, yeni istekler gönder.</p>
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
              tab === "friends" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setTab("friends")}
          >
            <Users className="size-4" />
            Arkadaşlar
            {friends && friends.length > 0 && <span className="text-xs opacity-70">{friends.length}</span>}
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition cursor-pointer ${
              tab === "received" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setTab("received")}
          >
            <Inbox className="size-4" />
            Gelen
            {received && received.length > 0 && <span className="text-xs opacity-70">{received.length}</span>}
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition cursor-pointer ${
              tab === "sent" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setTab("sent")}
          >
            <Send className="size-4" />
            Gönderilen
            {sent && sent.length > 0 && <span className="text-xs opacity-70">{sent.length}</span>}
          </button>
        </div>

        {loading && currentList === null ? (
          <div className="rounded-xl border border-zinc-800 p-8 text-zinc-400">Yükleniyor…</div>
        ) : error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-8 text-red-300" role="alert">
            {error}
            <button
              className="mt-5 block rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 transition hover:bg-white cursor-pointer"
              onClick={() => void load(tab)}
            >
              Tekrar dene
            </button>
          </div>
        ) : !currentList || currentList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
            {emptyIcon}
            <p className="text-sm text-zinc-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
            {tab === "friends" &&
              (friends ?? []).map((friend, index) => {
                const isPending = pending === friend.id;
                return (
                  <div
                    key={friend.id}
                    className={`flex items-center justify-between gap-4 p-5 ${
                      index !== (friends?.length ?? 0) - 1 ? "border-b border-zinc-800" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <UserAvatar
                        size={96}
                        src={friend.avatarUrl}
                        name={friend.username || friend.name}
                        className="size-11 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {friend.name || friend.username || "İsimsiz kullanıcı"}
                        </p>
                        {friend.username && <p className="truncate text-sm text-zinc-500">@{friend.username}</p>}
                      </div>
                    </div>

                    <button
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isPending}
                      onClick={() => void removeFriendRow(friend)}
                    >
                      <UserRoundX className="size-4" />
                      {isPending ? "Kaldırılıyor…" : "Kaldır"}
                    </button>
                  </div>
                );
              })}

            {(tab === "received" || tab === "sent") &&
              (tab === "received" ? received ?? [] : sent ?? []).map((request, index, arr) => {
                const isPending = pending === request.id;
                return (
                  <div
                    key={request.id}
                    className={`flex items-center justify-between gap-4 p-5 ${
                      index !== arr.length - 1 ? "border-b border-zinc-800" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <UserAvatar
                        size={96}
                        src={request.user.avatarUrl}
                        name={request.user.username || request.user.name}
                        className="size-11 shrink-0 rounded-full object-cover"
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
                            onClick={() => void requestAction(request.id, "accept")}
                          >
                            <Check className="size-4" />
                            Kabul et
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isPending}
                            onClick={() => void requestAction(request.id, "decline")}
                          >
                            <X className="size-4" />
                            Reddet
                          </button>
                        </>
                      ) : (
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isPending}
                          onClick={() => void requestAction(request.id, "cancel")}
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