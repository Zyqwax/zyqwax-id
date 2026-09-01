"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, fetchMe, resendVerification, updateProfileField } from "@/lib/api";
import type { SafeUser } from "@/lib/types";
import { AvatarEditorModal } from "@/components/dashboard/AvatarEditorModal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ImageUp, SquarePen, Check, X } from "lucide-react";

type ModalName = "avatar" | null;

function cooldownDate(value: string | null | undefined, days: number) {
  if (!value) return null;
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date > new Date() ? date : null;
}

const inputClass =
  "mt-1 w-full h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-800 shadow-sm text-base text-white outline-none " +
  "transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-zinc-800";

export default function DashboardPage() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalName>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { user: fetched } = await fetchMe();
      setUser(fetched);
      setName(fetched.name || "");
      setUsername(fetched.username || "");
      setEmail(fetched.email || "");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Profil yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  const usernameCooldown = useMemo(() => cooldownDate(user?.usernameChangedAt, 7), [user?.usernameChangedAt]);
  const emailCooldown = useMemo(() => cooldownDate(user?.emailChangedAt, 7), [user?.emailChangedAt]);

  if (loading)
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-12">
        <div className="rounded-xl border border-zinc-800 p-8 text-zinc-400">Profil yükleniyor…</div>
      </div>
    );

  if (error || !user)
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-12">
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-8 text-red-300" role="alert">
          {error || "Profil bulunamadı."}
          <button
            className="mt-5 block rounded-lg bg-zinc-100 px-5 py-3 font-medium text-zinc-900 hover:bg-white transition cursor-pointer"
            onClick={() => void loadProfile()}
          >
            Tekrar dene
          </button>
        </div>
      </div>
    );

  const currentUser = user;

  function startEdit() {
    setEditing(true);
    setName(currentUser.name || "");
    setUsername(currentUser.username || "");
    setEmail(currentUser.email || "");
    setPassword("");
    setError("");
  }

  function cancelEdit() {
    setEditing(false);
    setPassword("");
    setName(currentUser.name || "");
    setUsername(currentUser.username || "");
    setEmail(currentUser.email || "");
    setError("");
  }

  async function saveField(field: "username" | "email" | "name", value: string) {
    const endpoint =
      field === "username" ? "/api/profile/username" : field === "email" ? "/api/profile/email" : "/api/profile/name";
    const result = await updateProfileField(
      endpoint,
      field === "name"
        ? { name: value }
        : field === "username"
          ? { username: value.toLowerCase(), currentPassword: password }
          : { email: value, currentPassword: password },
    );
    setUser(result.user);
  }

  async function saveChanges() {
    setError("");

    const usernameChanged = username !== currentUser.username;
    const emailChanged = email !== currentUser.email;
    const nameChanged = name !== currentUser.name;

    if (!usernameChanged && !emailChanged && !nameChanged) {
      cancelEdit();
      return;
    }

    if ((usernameChanged || emailChanged) && !password) {
      setError("Kullanıcı adı veya e-posta değişikliği için mevcut şifreni gir.");
      return;
    }

    setSaving(true);
    try {
      if (usernameChanged) await saveField("username", username);
      if (emailChanged) await saveField("email", email);
      if (nameChanged) await saveField("name", name);
      setEditing(false);
      setPassword("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Güncelleme yapılamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function resend() {
    setResending(true);
    setVerificationMessage("");
    try {
      setVerificationMessage((await resendVerification()).message);
    } catch (cause) {
      setVerificationMessage(cause instanceof ApiError ? cause.message : "Email gönderilemedi.");
    } finally {
      setResending(false);
    }
  }

  const avatar = user.avatarUrl;
  const needsPassword = username !== currentUser.username || email !== currentUser.email;

  function selectAvatarFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setAvatarFile(file);
    setModal("avatar");
  }

  function closeAvatarEditor() {
    setAvatarFile(null);
    setModal(null);
  }

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-12">
      <section aria-labelledby="profile-heading">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 id="profile-heading" className="text-lg font-medium text-zinc-100">
              Profil bilgileri
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Hesap kimliğini ve iletişim bilgilerini yönet.</p>
          </div>

          {!editing && (
            <button
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 cursor-pointer"
              onClick={startEdit}
            >
              <SquarePen className="size-4" />
              Düzenle
            </button>
          )}
        </div>

        {user.emailVerified === false && (
          <div className="border-l-4 border-red-400 bg-zinc-800/80 p-5 my-4 text-sm text-zinc-300 rounded-lg">
            <strong className="block text-zinc-100">Lütfen e-postanı doğrula</strong>
            <span className="mt-1 block">Doğrulama kodunu {user.email} adresine gönderdik.</span>
            <button
              className="mt-4 rounded-lg cursor-pointer border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void resend()}
              disabled={resending}
            >
              {resending ? "Gönderiliyor…" : "Tekrar gönder"}
            </button>
            {verificationMessage && <span className="ml-3 text-emerald-400">{verificationMessage}</span>}
          </div>
        )}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <label
              htmlFor="profile-avatar-input"
              className="group relative block size-32 cursor-pointer overflow-hidden rounded-full border-2 border-zinc-700 p-1.5"
              title="Profil fotoğrafını değiştir"
            >
              <UserAvatar
                size={256}
                src={avatar}
                name={user.username}
                className="size-full rounded-full object-cover"
              />
              <span className="absolute inset-0 grid place-items-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/55 group-hover:opacity-100">
                <ImageUp className="size-5" strokeWidth={1.8} />
              </span>
              <input
                id="profile-avatar-input"
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={selectAvatarFile}
              />
            </label>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 cursor-pointer"
              onClick={() => document.getElementById("profile-avatar-input")?.click()}
            >
              <ImageUp className="size-4" />
              Fotoğrafı değiştir
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="username" className="text-sm font-medium text-zinc-300">
                Kullanıcı adı
              </label>
              <div
                className={`mt-1 flex items-stretch overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 transition focus-within:border-zinc-400 ${
                  !editing ? "opacity-60" : ""
                }`}
              >
                <span className="flex select-none items-center border-r border-zinc-700 bg-zinc-800/80 px-3 text-sm text-zinc-400">
                  @
                </span>
                <input
                  type="text"
                  id="username"
                  className="h-10 w-full bg-transparent px-3 text-base text-white outline-none disabled:cursor-not-allowed"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!editing}
                />
              </div>
              {editing && usernameCooldown && (
                <p className="mt-1 text-xs text-amber-400">Yakında tekrar değiştirilebilir.</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                İsim
              </label>
              <input
                type="text"
                id="name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                E-posta adresi
              </label>
              <input
                type="email"
                id="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editing}
              />
              {editing && emailCooldown && (
                <p className="mt-1 text-xs text-amber-400">Yakında tekrar değiştirilebilir.</p>
              )}
            </div>

            {editing && needsPassword && (
              <div className="sm:col-span-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Mevcut şifre
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Kullanıcı adı veya e-posta değişikliği için gerekli"
                  className={`${inputClass} border-amber-700/70 focus:border-amber-400`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {editing && (
            <div className="flex items-center gap-3 pt-1">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void saveChanges()}
                disabled={saving}
              >
                <Check className="size-4" />
                {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                onClick={cancelEdit}
                disabled={saving}
              >
                <X className="size-4" />
                İptal
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </section>

      {modal === "avatar" && (
        <AvatarEditorModal
          user={user}
          initialFile={avatarFile}
          onClose={closeAvatarEditor}
          onSaved={(next) => {
            setUser(next);
            closeAvatarEditor();
          }}
        />
      )}
    </div>
  );
}
