"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/ui/UserAvatar";

export function LandingAuthActions() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return <div aria-hidden="true" className="h-10 w-32 animate-pulse rounded-lg bg-zinc-900" />;
  }

  if (status === "authenticated" && user) {
    const displayName = user.name || user.username || user.email;

    return (
      <Link
        href="/dashboard"
        aria-label={`${displayName} profiline git`}
        className="flex max-w-56 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 transition hover:border-zinc-700 hover:bg-zinc-900"
      >
        <UserAvatar
          size={40}
          src={user.avatarUrl}
          username={user.username}
          name={user.name || user.email}
        />
        <span className="truncate text-sm font-medium text-zinc-100">{displayName}</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
      >
        Giriş yap
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
      >
        Hesap oluştur
      </Link>
    </div>
  );
}
