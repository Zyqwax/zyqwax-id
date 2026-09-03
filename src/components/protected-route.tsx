// src/components/protected-route.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { FullscreenLoader } from "./fullscreen-loader";

function safeNextPath(pathname: string): string {
  return pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/dashboard";
}

export function ProtectedRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(safeNextPath(pathname))}`);
    }
  }, [pathname, router, status]);

  if (status === "loading") {
    return <FullscreenLoader />;
  }

  if (status !== "authenticated") {
    return <FullscreenLoader />;
  }

  return <>{children}</>;
}
