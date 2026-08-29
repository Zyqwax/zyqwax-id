export type LoginValues = { email: string; password: string };
export type RegisterValues = LoginValues & { name: string };

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
  return validateEmail(values.email) ?? validatePassword(values.password);
}

export function validateRegister(values: RegisterValues): string | null {
  return validateEmail(values.email) ?? validatePassword(values.password) ??
    (values.name.trim().length > 100 ? 'İsim 100 karakterden kısa olmalı.' : null);
}
