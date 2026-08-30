'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function PublicRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [router, status]);

  if (status === 'loading' || status === 'authenticated') {
    return <div className="page-shell"><div className="loading-card" role="status">Oturum kontrol ediliyor<span className="loading-dots" aria-hidden="true">…</span></div></div>;
  }

  return <>{children}</>;
}
