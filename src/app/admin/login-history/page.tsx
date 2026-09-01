'use client';

import { useEffect, useState } from 'react';
import { ApiError, request } from '@/lib/api';
import { PageLoader } from '@/components/page-loader';

type RecordItem = { id: string; ipAddress: string; userAgent: string; success: boolean; createdAt: string; user: { email: string; username: string } };
const date = (value: string) => new Date(value).toLocaleString('tr-TR');

export default function LoginHistoryPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { request<{ records: RecordItem[] }>('/api/admin/login-history').then(result => setRecords(result.records)).catch(cause => setError(cause instanceof ApiError ? cause.message : 'Login kayıtları yüklenemedi.')).finally(() => setLoaded(true)); }, []);
  if (!loaded && !error) return <PageLoader label="Login kayıtları yükleniyor…" />;
  return <section className="space-y-5"><header><p className="text-sm text-zinc-500">Yönetim</p><h1 className="mt-1 text-3xl font-semibold">Login kayıtları</h1></header>{error && <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-red-300" role="alert">{error}</p>}<div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"><table className="w-full text-left text-sm"><thead className="text-zinc-500"><tr><th className="p-2">Kullanıcı</th><th className="p-2">Sonuç</th><th className="p-2">IP</th><th className="p-2">User agent</th><th className="p-2">Tarih</th></tr></thead><tbody>{records.map(record => <tr key={record.id} className="border-t border-zinc-800"><td className="p-2">{record.user.username}<div className="text-xs text-zinc-500">{record.user.email}</div></td><td className={`p-2 ${record.success ? 'text-emerald-400' : 'text-red-400'}`}>{record.success ? 'Başarılı' : 'Başarısız'}</td><td className="p-2">{record.ipAddress}</td><td className="max-w-xs truncate p-2 text-zinc-400">{record.userAgent}</td><td className="p-2 text-zinc-400">{date(record.createdAt)}</td></tr>)}</tbody></table>{!records.length && <p className="p-4 text-zinc-500">Login kaydı yok.</p>}</div></section>;
}
