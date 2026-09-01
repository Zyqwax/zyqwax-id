'use client';

import { useEffect, useState } from 'react';
import { ApiError, request } from '@/lib/api';
import { PageLoader } from '@/components/page-loader';

type User = { id: string; email: string; username: string; name: string | null; roles: string[]; isActive: boolean; emailVerified: boolean; createdAt: string };
const date = (value: string) => new Date(value).toLocaleString('tr-TR');

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { request<{ users: User[] }>('/api/admin/users').then(result => setUsers(result.users)).catch(cause => setError(cause instanceof ApiError ? cause.message : 'Kullanıcılar yüklenemedi.')).finally(() => setLoaded(true)); }, []);
  if (!loaded && !error) return <PageLoader label="Kullanıcılar yükleniyor…" />;
  return <section className="space-y-5"><header><p className="text-sm text-zinc-500">Yönetim</p><h1 className="mt-1 text-3xl font-semibold">Kullanıcılar</h1></header>{error && <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-red-300" role="alert">{error}</p>}<div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"><table className="w-full text-left text-sm"><thead className="text-zinc-500"><tr><th className="p-2">Kullanıcı</th><th className="p-2">Roller</th><th className="p-2">Durum</th><th className="p-2">Kayıt</th></tr></thead><tbody>{users.map(user => <tr key={user.id} className="border-t border-zinc-800"><td className="p-2"><div>{user.name || user.username}</div><div className="text-xs text-zinc-500">{user.email}</div></td><td className="p-2 text-xs text-zinc-400">{user.roles.join(', ') || '—'}</td><td className="p-2">{user.isActive ? 'Aktif' : 'Pasif'} · {user.emailVerified ? 'Doğrulandı' : 'Doğrulanmadı'}</td><td className="p-2 text-zinc-400">{date(user.createdAt)}</td></tr>)}</tbody></table>{!users.length && <p className="p-4 text-zinc-500">Kayıtlı kullanıcı yok.</p>}</div></section>;
}
