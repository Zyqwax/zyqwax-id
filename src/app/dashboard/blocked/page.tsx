'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchBlocked, unblockUser, type FriendListItem } from '@/lib/api';
import { ListRow } from '@/components/ui/ListRow';

type BlockedItem = { id: string; createdAt: string; user: FriendListItem };

// Engellenen kullanıcıları listeler ve engel kaldırma işlemini API üzerinden yürütür.
export default function BlockedPage() {
  const [blocked, setBlocked] = useState<BlockedItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [pending, setPending] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setBlocked((await fetchBlocked()).blocked as BlockedItem[]); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Engellenenler yüklenemedi.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  async function unblock(id: string) { setPending(id); setError(''); try { await unblockUser(id); setBlocked((items) => items.filter((item) => item.user.id !== id)); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Engel kaldırılamadı.'); } finally { setPending(null); } }
  return <div className="dashboard-content"><header className="content-header"><div><p className="section-kicker">SOSYAL / GİZLİLİK</p><h1>Engellenenler</h1><p className="content-intro">Görmek istemediğin hesapları yönet.</p></div></header>{loading ? <div className="loading-card">Engellenenler yükleniyor…</div> : error ? <div className="panel-error" role="alert">{error}<button className="button-secondary mt-4" onClick={() => void load()}>Tekrar dene</button></div> : blocked.length === 0 ? <div className="empty-panel">Engellenen kullanıcı yok.</div> : <div className="list-stack">{blocked.map((item) => <ListRow key={item.id} title={item.user.name || item.user.username || 'İsimsiz kullanıcı'} subtitle={item.user.username ? `@${item.user.username}` : undefined} avatarUrl={item.user.avatarUrl} actions={<button className="button-secondary" disabled={pending === item.user.id} onClick={() => void unblock(item.user.id)}>{pending === item.user.id ? '…' : 'Engeli kaldır'}</button>} />)}</div>}</div>;
}
