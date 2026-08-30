'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '@/lib/api';
import { clearSession, setSession, subscribeToAuthChanges } from '@/lib/auth-store';
import type { SafeUser } from '@/lib/types';

type AuthContextValue = {
  user: SafeUser | null;
  accessToken: string | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
let bootstrapPromise: Promise<boolean> | null = null;

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      if (mounted.current) {
        setUser(nextUser);
        if (!nextUser) setAccessToken(null);
      }
    });
    return () => { mounted.current = false; unsubscribe(); };
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!bootstrapPromise) {
      const operation = (async () => {
        const token = await api.refreshAccessToken();
        if (!token) return false;
        try {
          const result = await api.fetchMe();
          if (mounted.current) {
            setSession(token, result.user);
            setAccessToken(token);
            setUser(result.user);
            setStatus('authenticated');
          }
          return true;
        } catch {
          clearSession();
          return false;
        }
      })();
      bootstrapPromise = operation;
      void operation.finally(() => {
        if (bootstrapPromise === operation) bootstrapPromise = null;
      });
    }
    const authenticated = await bootstrapPromise;
    if (mounted.current && !authenticated) setStatus('unauthenticated');
    return authenticated;
  }, []);

  useEffect(() => { void refreshSession(); }, [refreshSession]);

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await api.login(identifier, password);
    setSession(result.accessToken, result.user);
    setAccessToken(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const result = await api.register(email, username, password);
    setSession(result.accessToken, result.user);
    setAccessToken(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } finally {
      clearSession();
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo(() => ({ user, accessToken, status, login, register, logout, refreshSession }),
    [user, accessToken, status, login, register, logout, refreshSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth AuthProvider içinde kullanılmalı.');
  return context;
}
