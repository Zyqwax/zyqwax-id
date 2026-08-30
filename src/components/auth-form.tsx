'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { validateEmail, validateLogin, validatePassword } from '@/lib/validation';
import { usernameSchema } from '@/lib/validation/username';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFieldErrors: Record<string, string> = {};
    if (isRegister) {
      const emailError = validateEmail(email);
      const usernameResult = usernameSchema.safeParse(username);
      const passwordError = validatePassword(password);
      if (emailError) nextFieldErrors.email = emailError;
      if (!usernameResult.success) nextFieldErrors.username = usernameResult.error.issues[0]?.message ?? 'Geçerli bir kullanıcı adı girin.';
      if (passwordError) nextFieldErrors.password = passwordError;
    } else {
      const identifierError = validateLogin({ identifier: email, password });
      if (!email.trim()) nextFieldErrors.identifier = 'E-posta veya kullanıcı adınızı girin.';
      if (identifierError && password.length < 1) nextFieldErrors.password = 'Şifrenizi girin.';
      if (password.length > 0 && password.length < 8) nextFieldErrors.password = 'Şifre en az 8 karakter olmalı.';
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length) { setError(''); return; }
    setError('');
    setPending(true);
    try {
      if (isRegister) await register(email.trim(), username.trim().toLowerCase(), password);
      else await login(email.trim(), password);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        // OAuth bir Route Handler olduğu için _rsc eklenmemesi adına tam sayfa açılır.
        window.location.href = safeRedirect(redirect);
      } else {
        router.replace(safeRedirect(searchParams.get('next')));
      }
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : 'İşlem tamamlanamadı. Tekrar deneyin.';
      if (isRegister && message.includes('kullanıcı adı')) setFieldErrors({ username: message });
      else if (isRegister && message.includes('e-posta')) setFieldErrors({ email: message });
      else if (!isRegister) setFieldErrors({ identifier: message });
      else setError(message);
    } finally { setPending(false); }
  }

  return <form className="auth-form" onSubmit={handleSubmit} noValidate>
    <label>{isRegister ? 'E-posta' : 'E-posta veya kullanıcı adı'} <input name={isRegister ? 'email' : 'identifier'} type={isRegister ? 'email' : 'text'} value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((current) => ({ ...current, [isRegister ? 'email' : 'identifier']: '' })); }} autoComplete={isRegister ? 'email' : 'username'} required placeholder={isRegister ? 'sen@ornek.com' : 'eposta@ornek.com veya kullanici_adi'} aria-invalid={Boolean(fieldErrors[isRegister ? 'email' : 'identifier'])} />{fieldErrors[isRegister ? 'email' : 'identifier'] && <span className="form-error" role="alert">{fieldErrors[isRegister ? 'email' : 'identifier']}</span>}</label>
    {isRegister && <label>Kullanıcı adı <input name="username" value={username} onChange={(e) => { setUsername(e.target.value.toLowerCase()); setFieldErrors((current) => ({ ...current, username: '' })); }} autoComplete="username" minLength={3} maxLength={20} pattern="[a-z][a-z0-9_]*" required placeholder="kullanici_adi" aria-invalid={Boolean(fieldErrors.username)} />{fieldErrors.username && <span className="form-error" role="alert">{fieldErrors.username}</span>}</label>}
    <label>Şifre <input name="password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((current) => ({ ...current, password: '' })); }} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} required placeholder="En az 8 karakter" aria-invalid={Boolean(fieldErrors.password)} />{fieldErrors.password && <span className="form-error" role="alert">{fieldErrors.password}</span>}</label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary button-wide" type="submit" disabled={pending}>{pending ? 'Bekleyin…' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}</button>
    {!isRegister && <p className="form-switch"><Link href="/forgot-password">Şifremi unuttum</Link></p>}
    <p className="form-switch">{isRegister ? 'Zaten hesabın var mı?' : 'İlk kez mi buradasın?'}{' '}<Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Giriş yap' : 'Kayıt ol'}</Link></p>
  </form>;
}
