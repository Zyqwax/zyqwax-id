'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { validateLogin, validateRegister } from '@/lib/validation';
import { useAuth } from './auth-provider';

type AuthFormProps = { mode: 'login' | 'register' };

function safeRedirect(value: string | null): string {
  if (!value) return '/dashboard';
  try {
    const target = new URL(value, window.location.origin);
    const decodedPath = decodeURIComponent(target.pathname);
    if (target.origin !== window.location.origin || !decodedPath.startsWith('/') || decodedPath.startsWith('//') || decodedPath.includes('\\')) {
      return '/dashboard';
    }
    return `${target.pathname}${target.search}`;
  } catch {
    return '/dashboard';
  }
}

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = { email, password };
    const validationError = isRegister ? validateRegister({ ...values, name }) : validateLogin(values);
    if (validationError) { setError(validationError); return; }
    setError('');
    setPending(true);
    try {
      if (isRegister) await register(email.trim(), password, name.trim() || undefined);
      else await login(email.trim(), password);
      const returnTo = searchParams.get('redirect') ?? searchParams.get('next');
      router.replace(safeRedirect(returnTo));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'İşlem tamamlanamadı. Tekrar deneyin.');
    } finally { setPending(false); }
  }

  return <form className="auth-form" onSubmit={handleSubmit} noValidate>
    {isRegister && <label>İsim <input name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} placeholder="Nasıl hitap edelim?" /></label>}
    <label>E-posta <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="sen@ornek.com" /></label>
    <label>Şifre <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} required placeholder="En az 8 karakter" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary button-wide" type="submit" disabled={pending}>{pending ? 'Bekleyin…' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}</button>
    <p className="form-switch">{isRegister ? 'Zaten hesabın var mı?' : 'İlk kez mi buradasın?'}{' '}<Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Giriş yap' : 'Kayıt ol'}</Link></p>
  </form>;
}
