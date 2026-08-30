'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchFriends, removeFriend, type FriendListItem } from '@/lib/api';
import { ListRow } from '@/components/ui/ListRow';

// Arkadaş listesini yükler ve karşılıklı arkadaş kaldırma işlemini yönetir.
export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendListItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [pending, setPending] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setFriends((await fetchFriends()).friends); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Arkadaşlar yüklenemedi.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  async function remove(friend: FriendListItem) { if (!window.confirm(`${friend.name || friend.username || 'Bu kullanıcı'} arkadaşlıktan çıkarılsın mı?`)) return; setPending(friend.id); try { await removeFriend(friend.id); setFriends((items) => items.filter((item) => item.id !== friend.id)); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Arkadaş kaldırılamadı.'); } finally { setPending(null); } }
  return <div className="dashboard-content"><header className="content-header"><div><p className="section-kicker">SOSYAL / AĞ</p><h1>Arkadaşlar</h1><p className="content-intro">Bağlantılarını yönet.</p></div></header>{loading ? <div className="loading-card">Arkadaşlar yükleniyor…</div> : error ? <div className="panel-error" role="alert">{error}<button className="button-secondary mt-4" onClick={() => void load()}>Tekrar dene</button></div> : friends.length === 0 ? <div className="empty-panel">Henüz arkadaşın yok.</div> : <div className="list-stack">{friends.map((friend) => <ListRow key={friend.id} title={friend.name || friend.username || 'İsimsiz kullanıcı'} subtitle={friend.username ? `@${friend.username}` : undefined} avatarUrl={friend.avatarUrl} actions={<button className="button-danger" disabled={pending === friend.id} onClick={() => void remove(friend)}>{pending === friend.id ? '…' : 'Kaldır'}</button>} />)}</div>}</div>;
}
