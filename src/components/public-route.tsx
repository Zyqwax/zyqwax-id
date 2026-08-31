// src/components/public-route.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";
import { FullscreenLoader } from "./fullscreen-loader";

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

export function PublicRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status !== "authenticated") return;

    const redirect = searchParams.get("redirect");

    if (redirect) {
      // OAuth Route Handler için tam sayfa navigasyon.
      window.location.href = safeRedirect(redirect);
      return;
    }

    router.replace(safeRedirect(searchParams.get("next")));
  }, [router, searchParams, status]);

  if (status === "loading" || status === "authenticated") {
    return <FullscreenLoader />;
  }

  return <>{children}</>;
}
