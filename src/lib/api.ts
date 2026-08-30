import { clearSession, getAccessToken, setAccessToken } from './auth-store';
import type { ApiErrorShape, AuthResponse, SafeUser } from './types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = RequestInit & { retry?: boolean; skipRefresh?: boolean };
let refreshPromise: Promise<string | null> | null = null;

async function readResponseBody(response: Response): Promise<ApiErrorShape | Record<string, unknown>> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return {};
  try {
    const value: unknown = await response.json();
    return value && typeof value === 'object' ? value as ApiErrorShape : {};
  } catch {
    return {};
  }
}

function errorMessage(body: ApiErrorShape, status: number): string {
  if (typeof body.error === 'string' && body.error.trim()) return body.error;
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  return status >= 500 ? 'Sunucuya şu anda ulaşılamıyor.' : 'İstek tamamlanamadı.';
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      });
      const body = await readResponseBody(response) as { accessToken?: unknown } & ApiErrorShape;
      if (!response.ok || typeof body.accessToken !== 'string' || !body.accessToken) {
        clearSession();
        return null;
      }
      setAccessToken(body.accessToken);
      return body.accessToken;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { retry = true, skipRefresh = false, ...init } = options;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);
  const externalAbort = () => controller.abort();
  init.signal?.addEventListener('abort', externalAbort, { once: true });

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers,
      credentials: init.credentials ?? 'include',
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('Ağ bağlantısı kurulamadı veya istek zaman aşımına uğradı. Tekrar deneyin.', 0);
  } finally {
    clearTimeout(timeoutId);
    init.signal?.removeEventListener('abort', externalAbort);
  }

  const body = await readResponseBody(response);
  if (response.status === 401 && retry && !skipRefresh && path !== '/api/auth/refresh') {
    const nextToken = await refreshAccessToken();
    if (nextToken) return request<T>(path, { ...options, retry: false });
    throw new ApiError('Oturumunuz sona erdi. Yeniden giriş yapın.', 401);
  }
  if (!response.ok) throw new ApiError(errorMessage(body as ApiErrorShape, response.status), response.status);
  return body as T;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }), skipRefresh: true,
  });
}

export function register(email: string, password: string, name?: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST', body: JSON.stringify({ email, password, ...(name ? { name } : {}) }), skipRefresh: true,
  });
}

export function fetchMe(): Promise<{ user: SafeUser }> {
  return request<{ user: SafeUser }>('/api/auth/me');
}

export function logout(): Promise<{ message: string }> {
  return request<{ message: string }>('/api/auth/logout', { method: 'POST', skipRefresh: true });
}

export { refreshAccessToken };
