"use client";

import { useEffect, useState } from "react";
import { ApiError, request } from "@/lib/api";
import { PageLoader } from "@/components/page-loader";

type User = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
};
type Role = { id: string; displayName: string };
const date = (value: string) => new Date(value).toLocaleString("tr-TR");

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    Promise.all([request<{ users: User[] }>("/api/admin/users"), request<{ roles: Role[] }>("/api/admin/roles")])
      .then(([usersResult, rolesResult]) => {
        setUsers(usersResult.users);
        setRoles(rolesResult.roles);
      })
      .catch((cause) => setError(cause instanceof ApiError ? cause.message : "Kullanıcılar yüklenemedi."))
      .finally(() => setLoaded(true));
  }, []);
  async function saveRoles() {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      await request(`/api/admin/users/${editing.id}/roles`, {
        method: "PATCH",
        body: JSON.stringify({ roleIds: selectedRoles }),
      });
      setUsers((current) => current.map((user) => (user.id === editing.id ? { ...user, roles: selectedRoles } : user)));
      setEditing(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Roller kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }
  if (!loaded && !error) return <PageLoader label="Kullanıcılar yükleniyor…" />;
  return (
    <section className="space-y-5">
      <header>
        <p className="text-sm text-zinc-500">Yönetim</p>
        <h1 className="mt-1 text-3xl font-semibold">Kullanıcılar</h1>
      </header>
      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-red-300" role="alert">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500">
            <tr>
              <th className="p-2">Kullanıcı</th>
              <th className="p-2">Roller</th>
              <th className="p-2">Durum</th>
              <th className="p-2">Kayıt</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-zinc-800">
                <td className="p-2">
                  <div>{user.name || user.username}</div>
                  <div className="text-xs text-zinc-500">{user.email}</div>
                </td>
                <td className="p-2 text-xs text-zinc-400">{user.roles.join(", ") || "—"}</td>
                <td className="p-2">
                  {user.isActive ? "Aktif" : "Pasif"} · {user.emailVerified ? "Doğrulandı" : "Doğrulanmadı"}
                </td>
                <td className="p-2 text-zinc-400">{date(user.createdAt)}</td>
                <td className="p-2">
                  <button
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs"
                    onClick={() => {
                      setEditing(user);
                      setSelectedRoles(user.roles);
                    }}
                  >
                    Rolleri düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="p-4 text-zinc-500">Kayıtlı kullanıcı yok.</p>}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">Kullanıcı rollerini düzenle</h2>
            <p className="mt-1 text-sm text-zinc-400">{editing.email}</p>
            <div className="mt-5 space-y-3">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 p-3">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={(event) =>
                      setSelectedRoles((current) =>
                        event.target.checked ? [...current, role.id] : current.filter((id) => id !== role.id),
                      )
                    }
                  />
                  {role.displayName}
                  <span className="ml-auto text-xs text-zinc-500">{role.id}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" onClick={() => setEditing(null)}>
                İptal
              </button>
              <button
                disabled={saving || !selectedRoles.length}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                onClick={() => void saveRoles()}
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
