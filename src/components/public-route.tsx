'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './auth-provider';

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

export function PublicRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(safeRedirect(searchParams.get('redirect') ?? searchParams.get('next')));
    }
  }, [router, searchParams, status]);

  if (status === 'loading' || status === 'authenticated') {
    return <div className="page-shell"><div className="loading-card" role="status">Oturum kontrol ediliyor<span className="loading-dots" aria-hidden="true">…</span></div></div>;
  }

  return <>{children}</>;
}
