'use client';

import { useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { ApiError, request } from '@/lib/api';
import type { SafeUser } from '@/lib/types';
import { getCroppedImage } from '@/lib/image/getCroppedImage';
import { CooldownBadge } from '@/components/ui/CooldownBadge';
import { Modal } from '@/components/ui/Modal';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type SignatureResponse = { signature: string; timestamp: number; apiKey: string; cloudName: string; publicId: string };

// Avatar seçme, kırpma, doğrudan Cloudinary yükleme ve silme akışını yönetir.
export function AvatarEditorModal({ user, onClose, onSaved, initialFile = null }: { user: SafeUser; onClose: () => void; onSaved: (user: SafeUser) => void; initialFile?: File | null }) {
  const [source, setSource] = useState<string | null>(() => initialFile && typeof window !== 'undefined' ? window.URL.createObjectURL(initialFile) : null);
  const [fileName, setFileName] = useState(() => initialFile?.name || '');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState<Date | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);

  // Dosyayı seçer ve cropper'ın göstereceği geçici object URL'sini oluşturur.
  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Lütfen bir görsel dosyası seç.'); return; }
    if (source) URL.revokeObjectURL(source);
    setSource(URL.createObjectURL(file)); setFileName(file.name); setError(''); setZoom(1); setRotation(0); setCrop({ x: 0, y: 0 });
  }

  // Kırpılmış PNG'yi imzalayıp Cloudinary'ye yükler ve sonucu profile kaydeder.
  async function submit() {
    if (!source || !croppedAreaPixels) { setError('Önce bir görsel seçip kırp.'); return; }
    setPending(true); setError(''); setCooldown(null);
    try {
      const blob = await getCroppedImage(source, croppedAreaPixels, rotation);
      if (blob.size > MAX_FILE_SIZE) throw new Error('Görsel 5 MB sınırını aşamaz.');
      const signature = await request<SignatureResponse>('/api/profile/avatar/signature', { method: 'POST' });
      const form = new FormData();
      form.append('file', blob, 'avatar.png'); form.append('api_key', signature.apiKey); form.append('timestamp', String(signature.timestamp)); form.append('signature', signature.signature); form.append('public_id', signature.publicId); form.append('overwrite', 'true');
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`, { method: 'POST', body: form });
      const uploadBody = await uploadResponse.json() as { secure_url?: string; error?: { message?: string } };
      if (!uploadResponse.ok || !uploadBody.secure_url) throw new Error(uploadBody.error?.message ?? 'Görsel Cloudinary\'ye yüklenemedi.');
      const result = await request<{ user: SafeUser }>('/api/profile/avatar', { method: 'PATCH', body: JSON.stringify({ avatarUrl: uploadBody.secure_url, avatarPublicId: signature.publicId }) });
      onSaved(result.user);
    } catch (cause) {
      const apiError = cause instanceof ApiError ? cause : null;
      if (apiError?.status === 429 && apiError.nextAllowedAt) setCooldown(new Date(apiError.nextAllowedAt));
      setError(apiError?.message ?? (cause instanceof Error ? cause.message : 'Güncelleme yapılamadı.'));
    } finally { setPending(false); }
  }

  // Avatarı backend üzerinden Cloudinary'den de sildirir.
  async function removeAvatar() {
    if (!window.confirm('Avatarını kaldırmak istediğine emin misin?')) return;
    setPending(true); setError(''); setCooldown(null);
    try { const result = await request<{ user: SafeUser }>('/api/profile/avatar', { method: 'DELETE' }); onSaved(result.user); }
    catch (cause) { const apiError = cause instanceof ApiError ? cause : null; if (apiError?.status === 429 && apiError.nextAllowedAt) setCooldown(new Date(apiError.nextAllowedAt)); setError(apiError?.message ?? 'Avatar kaldırılamadı.'); }
    finally { setPending(false); }
  }

  return <Modal title="Profil fotoğrafını değiştir" onClose={onClose}>
    <div className="space-y-6">
      <div><p className="mb-2 text-sm font-medium text-zinc-200">Yeni görsel</p><label htmlFor="avatar-file" className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-zinc-600 bg-zinc-800/70 p-5 transition hover:border-zinc-400 hover:bg-zinc-800"><span className="grid size-12 shrink-0 place-items-center rounded-lg bg-zinc-700 text-2xl text-zinc-200">↑</span><span className="min-w-0"><strong className="block text-sm font-medium text-zinc-100">{fileName || 'Görsel seç veya buraya tıkla'}</strong><span className="mt-1 block text-xs text-zinc-400">PNG, JPG veya WEBP · En fazla 5 MB</span></span><input id="avatar-file" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectFile} disabled={pending} /></label></div>
      {source && <><div><p className="mb-2 text-sm font-medium text-zinc-200">Önizleme ve kırpma</p><div className="relative h-72 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800"><Cropper image={source} crop={crop} zoom={zoom} rotation={rotation} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} /></div></div><label className="block text-sm text-zinc-300">Yakınlaştır<input className="mt-3 w-full accent-zinc-200" type="range" min={1} max={3} step={0.1} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} disabled={pending} /></label><div className="flex gap-3"><button className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => setRotation((value) => value - 90)} disabled={pending}>↺ Sola döndür</button><button className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => setRotation((value) => value + 90)} disabled={pending}>↻ Sağa döndür</button></div></>}
      {error && <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300" role="alert">{error}</p>}
      <CooldownBadge nextAllowedAt={cooldown} />
      <div className="flex items-center justify-between gap-2"><div>{(user.avatarUrl || user.avatar) && <button className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => void removeAvatar()} disabled={pending}>Avatarı kaldır</button>}</div><div className="flex gap-2"><button className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={onClose} disabled={pending}>İptal</button><button className="cursor-pointer rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => void submit()} disabled={pending || !source}>{pending ? 'Yükleniyor…' : 'Kaydet'}</button></div></div>
    </div>
  </Modal>;
}
