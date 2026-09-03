"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { validateEmail, validateLogin, validatePassword } from "@/lib/validation";
import { usernameSchema } from "@/lib/validation/username";
import { useAuth } from "./auth-provider";

type AuthFormProps = { mode: "login" | "register" };

function safeRedirect(value: string | null): string {
  if (!value) return "/dashboard";
  try {
    const target = new URL(value, window.location.origin);
    const decodedPath = decodeURIComponent(target.pathname);
    if (
      target.origin !== window.location.origin ||
      !decodedPath.startsWith("/") ||
      decodedPath.startsWith("//") ||
      decodedPath.includes("\\")
    ) {
      return "/dashboard";
    }
    return `${target.pathname}${target.search}`;
  } catch {
    return "/dashboard";
  }
}

const inputClass =
  "mt-1 w-full h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-800 text-base text-white outline-none " +
  "transition placeholder:text-zinc-600 focus:border-zinc-400 aria-[invalid=true]:border-red-700";

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      if (!usernameResult.success)
        nextFieldErrors.username = usernameResult.error.issues[0]?.message ?? "Geçerli bir kullanıcı adı girin.";
      if (passwordError) nextFieldErrors.password = passwordError;
    } else {
      const identifierError = validateLogin({ identifier: email, password });
      if (!email.trim()) nextFieldErrors.identifier = "E-posta veya kullanıcı adınızı girin.";
      if (identifierError && password.length < 1) nextFieldErrors.password = "Şifrenizi girin.";
      if (password.length > 0 && password.length < 8) nextFieldErrors.password = "Şifre en az 8 karakter olmalı.";
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length) {
      setError("");
      return;
    }
    setError("");
    setPending(true);
    try {
      if (isRegister) await register(email.trim(), username.trim().toLowerCase(), password);
      else await login(email.trim(), password);
      const redirect = searchParams.get("redirect");
      if (redirect) {
        // OAuth bir Route Handler olduğu için _rsc eklenmemesi adına tam sayfa açılır.
        window.location.href = safeRedirect(redirect);
      } else {
        router.replace(safeRedirect(searchParams.get("next")));
      }
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : "İşlem tamamlanamadı. Tekrar deneyin.";
      if (isRegister && message.includes("kullanıcı adı")) setFieldErrors({ username: message });
      else if (isRegister && message.includes("e-posta")) setFieldErrors({ email: message });
      else if (!isRegister) setFieldErrors({ identifier: message });
      else setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="auth-email" className="text-sm font-medium text-zinc-300">
          {isRegister ? "E-posta" : "E-posta veya kullanıcı adı"}
        </label>
        <input
          id="auth-email"
          name={isRegister ? "email" : "identifier"}
          type={isRegister ? "email" : "text"}
          className={inputClass}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((current) => ({ ...current, [isRegister ? "email" : "identifier"]: "" }));
          }}
          autoComplete={isRegister ? "email" : "username"}
          required
          placeholder={isRegister ? "sen@ornek.com" : "eposta@ornek.com veya kullanici_adi"}
          aria-invalid={Boolean(fieldErrors[isRegister ? "email" : "identifier"])}
        />
        {fieldErrors[isRegister ? "email" : "identifier"] && (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {fieldErrors[isRegister ? "email" : "identifier"]}
          </p>
        )}
      </div>

      {isRegister && (
        <div>
          <label htmlFor="auth-username" className="text-sm font-medium text-zinc-300">
            Kullanıcı adı
          </label>
          <div className="mt-1 flex items-stretch overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 transition focus-within:border-zinc-400 has-[input[aria-invalid=true]]:border-red-700">
            <span className="flex select-none items-center border-r border-zinc-700 bg-zinc-800/80 px-3 text-sm text-zinc-400">
              @
            </span>
            <input
              id="auth-username"
              name="username"
              className="h-10 w-full bg-transparent px-3 text-base text-white outline-none placeholder:text-zinc-600"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase());
                setFieldErrors((current) => ({ ...current, username: "" }));
              }}
              autoComplete="username"
              minLength={3}
              maxLength={20}
              pattern="[a-z][a-z0-9_]*"
              required
              placeholder="kullanici_adi"
              aria-invalid={Boolean(fieldErrors.username)}
            />
          </div>
          {fieldErrors.username && (
            <p className="mt-1 text-xs text-red-400" role="alert">
              {fieldErrors.username}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="auth-password" className="text-sm font-medium text-zinc-300">
          Şifre
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((current) => ({ ...current, password: "" }));
          }}
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={8}
          required
          placeholder="En az 8 karakter"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Bekleyin…" : isRegister ? "Hesap oluştur" : "Giriş yap"}
      </button>

      {!isRegister && (
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-zinc-400 transition hover:text-zinc-200">
            Şifremi unuttum
          </Link>
        </p>
      )}

      <p className="text-center text-sm text-zinc-500">
        {isRegister ? "Zaten hesabın var mı? " : "İlk kez mi buradasın? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-medium text-zinc-200 transition hover:text-white"
        >
          {isRegister ? "Giriş yap" : "Kayıt ol"}
        </Link>
      </p>
    </form>
  );
}
