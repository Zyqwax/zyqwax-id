'use client';

import { useState } from 'react';
import { ApiError, updateProfileField } from '@/lib/api';
import type { SafeUser } from '@/lib/types';
import { CooldownBadge } from '@/components/ui/CooldownBadge';
import { Modal } from '@/components/ui/Modal';

// İsim değişikliğini parola istemeden yöneten modal.
export function EditNameModal({ user, onClose, onSaved }: { user: SafeUser; onClose: () => void; onSaved: (user: SafeUser) => void }) {
  const [name, setName] = useState(user.name ?? ''); const [error, setError] = useState(''); const [cooldown, setCooldown] = useState<Date | null>(null); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setPending(true); setError(''); try { const result = await updateProfileField('/api/profile/name', { name }); onSaved(result.user); } catch (cause) { const apiError = cause instanceof ApiError ? cause : null; if (apiError?.status === 429) setCooldown(apiError.nextAllowedAt ? new Date(apiError.nextAllowedAt) : null); else setError(apiError?.message ?? 'Güncelleme yapılamadı.'); } finally { setPending(false); } }
  return <Modal title="İsmi düzenle" onClose={onClose}><form onSubmit={submit} className="space-y-4"><label className="block text-xs text-text-secondary">İsim<input className="mt-1.5 h-9 w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} required /></label>{error && <p className="text-xs text-accent-danger-text" role="alert">{error}</p>}<CooldownBadge nextAllowedAt={cooldown} /><button className="h-9 rounded-lg bg-text-primary px-3.5 text-xs font-medium text-bg-surface" disabled={pending}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</button></form></Modal>;
}
