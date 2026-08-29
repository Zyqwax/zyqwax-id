'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

function safeNextPath(pathname: string): string {
  return pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/dashboard';
}

export function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?next=${encodeURIComponent(safeNextPath(pathname))}`);
    }
  }, [pathname, router, status]);

  if (status === 'loading') return <div className="page-shell"><div className="loading-card" role="status">Oturum kontrol ediliyor<span className="loading-dots" aria-hidden="true">…</span></div></div>;
  if (status !== 'authenticated') return null;
  return <>{children}</>;
}
