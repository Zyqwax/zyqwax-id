"use client";

import { useEffect, useState } from "react";
import { ApiError, request } from "@/lib/api";
import { PageLoader } from "@/components/page-loader";

type Permission = { id: string; tag: string; displayName: string };
type Role = { id: string; displayName: string; userCount: number; permissions: Permission[] };
const empty = { displayName: "", permissionIds: [] as string[] };

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const result = await request<{ roles: Role[]; permissions: Permission[] }>("/api/admin/roles");
      setRoles(result.roles);
      setPermissions(result.permissions);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Roller yüklenemedi.");
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    // Veri yükleme, harici API ile senkronizasyondur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);
  function startEdit(role: Role) {
    setEditing(role.id);
    setForm({ displayName: role.displayName, permissionIds: role.permissions.map((permission) => permission.id) });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await request<{ role: Role }>(editing ? `/api/admin/roles/${editing}` : "/api/admin/roles", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      setRoles((current) =>
        editing ? current.map((role) => (role.id === editing ? result.role : role)) : [...current, result.role],
      );
      setEditing(null);
      setForm(empty);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Rol kaydedilemedi.");
    }
  }
  async function remove(role: Role) {
    if (!window.confirm(`${role.displayName} rolünü silmek istiyor musun?`)) return;
    try {
      await request(`/api/admin/roles/${role.id}`, { method: "DELETE" });
      setRoles((current) => current.filter((item) => item.id !== role.id));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Rol silinemedi.");
    }
  }
  if (!loaded && !error) return <PageLoader label="Roller yükleniyor…" />;
  return (
    <section className="space-y-5">
      <header>
        <p className="text-sm text-zinc-500">Yönetim</p>
        <h1 className="mt-1 text-3xl font-semibold">Roller ve yetkiler</h1>
        <p className="mt-2 text-zinc-400">
          Rollere izin bağlayın, kullanıcı rollerini ayrı olarak kullanıcılar sayfasından yönetin.
        </p>
      </header>
      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-red-300" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">{editing ? "Rolü düzenle" : "Yeni rol"}</h2>
          {editing && (
            <button
              type="button"
              className="text-sm text-zinc-400 hover:text-white"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              İptal
            </button>
          )}
        </div>
        <input
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
          placeholder="Rol adı"
          value={form.displayName}
          onChange={(event) => setForm({ ...form, displayName: event.target.value })}
          required
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {permissions.map((permission) => (
            <label key={permission.id} className="flex items-start gap-3 rounded-lg border border-zinc-800 p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.permissionIds.includes(permission.id)}
                onChange={(event) =>
                  setForm({
                    ...form,
                    permissionIds: event.target.checked
                      ? [...form.permissionIds, permission.id]
                      : form.permissionIds.filter((id) => id !== permission.id),
                  })
                }
              />
              <span>
                <span className="block text-zinc-200">{permission.displayName}</span>
                <code className="text-xs text-zinc-500">{permission.tag}</code>
              </span>
            </label>
          ))}
        </div>
        <button className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900">
          {editing ? "Rolü güncelle" : "Rol oluştur"}
        </button>
      </form>
      <div className="grid gap-3">
        {roles.map((role) => (
          <article key={role.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="font-semibold">{role.displayName}</h2>
                <code className="text-xs text-zinc-500">{role.id}</code>
                <p className="mt-2 text-sm text-zinc-400">
                  {role.userCount} kullanıcı ·{" "}
                  {role.permissions.map((permission) => permission.tag).join(", ") || "İzin yok"}
                </p>
              </div>
              <div className="flex gap-2">
                {!["role_user", "role_administrator"].includes(role.id) && (
                  <>
                    <button
                      className="rounded-lg border border-zinc-700 px-3 py-2 text-sm"
                      onClick={() => startEdit(role)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300"
                      onClick={() => void remove(role)}
                    >
                      Sil
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
