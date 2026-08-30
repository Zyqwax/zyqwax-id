import { usernameSchema } from './username';

export type LoginValues = { identifier: string; password: string };
export type RegisterValues = { email: string; username: string; password: string };

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'E-posta adresinizi girin.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Geçerli bir e-posta adresi girin.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Şifrenizi girin.';
  if (password.length < 8) return 'Şifre en az 8 karakter olmalı.';
  return null;
}

export function validateLogin(values: LoginValues): string | null {
  return !values.identifier.trim() ? 'E-posta veya kullanıcı adınızı girin.' : validatePassword(values.password);
}

export function validateRegister(values: RegisterValues): string | null {
  const usernameResult = usernameSchema.safeParse(values.username);
  if (!usernameResult.success) return 'Kullanıcı adı 3-20 karakter olmalı; küçük harfle başlamalı ve yalnızca harf, rakam, alt çizgi içermeli.';
  return validateEmail(values.email) ?? validatePassword(values.password);
}
