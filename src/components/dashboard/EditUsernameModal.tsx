'use client';

import { useState } from 'react';
import { ApiError, updateProfileField } from '@/lib/api';
import type { SafeUser } from '@/lib/types';
import { CooldownBadge } from '@/components/ui/CooldownBadge';
import { Modal } from '@/components/ui/Modal';

// Kullanıcı adı ve mevcut parola doğrulamasını birlikte yöneten modal.
export function EditUsernameModal({ user, onClose, onSaved }: { user: SafeUser; onClose: () => void; onSaved: (user: SafeUser) => void }) {
  const [username, setUsername] = useState(user.username ?? ''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [cooldown, setCooldown] = useState<Date | null>(null); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setPending(true); setError(''); try { const result = await updateProfileField('/api/profile/username', { username, currentPassword: password }); onSaved(result.user); } catch (cause) { const apiError = cause instanceof ApiError ? cause : null; if (apiError?.status === 429) setCooldown(apiError.nextAllowedAt ? new Date(apiError.nextAllowedAt) : null); else setError(apiError?.message ?? 'Güncelleme yapılamadı.'); } finally { setPending(false); } }
  return <Modal title="Kullanıcı adını düzenle" onClose={onClose}><form onSubmit={submit} className="space-y-4"><label className="block text-xs text-text-secondary">Yeni kullanıcı adı<input className="mt-1.5 h-9 w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} required /></label><label className="block text-xs text-text-secondary">Mevcut şifre<input className="mt-1.5 h-9 w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="text-xs text-accent-danger-text" role="alert">{error}</p>}<CooldownBadge nextAllowedAt={cooldown} /><button className="h-9 rounded-lg bg-text-primary px-3.5 text-xs font-medium text-bg-surface" disabled={pending}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</button></form></Modal>;
}
