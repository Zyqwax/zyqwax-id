#!/usr/bin/env node

/**
 * Exercises the native auth cookie flow without printing tokens or passwords.
 * Usage:
 *   TEST_EMAIL=you@example.com TEST_PASSWORD='...' pnpm test:auth
 *   node scripts/test-auth.mjs you@example.com '...'
 */

const baseUrl = (process.env.BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const email = process.env.TEST_EMAIL || process.argv[2];
const password = process.env.TEST_PASSWORD || process.argv[3];

if (!email || !password) {
  console.error('Usage: TEST_EMAIL=... TEST_PASSWORD=... pnpm test:auth');
  process.exit(2);
}

const cookies = new Map();

function applySetCookies(response) {
  const values = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')] : []);

  for (const value of values) {
    const pair = value.split(';', 1)[0];
    const separator = pair.indexOf('=');
    if (separator < 1) continue;
    const name = pair.slice(0, separator);
    const cookieValue = pair.slice(separator + 1);
    if (!cookieValue) cookies.delete(name);
    else cookies.set(name, cookieValue);
  }
}

function cookieHeader() {
  return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function request(path, init = {}) {
  const headers = new Headers(init.headers);
  if (cookies.size) headers.set('Cookie', cookieHeader());
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  applySetCookies(response);
  let body = null;
  const text = await response.text();
  if (text) {
    try { body = JSON.parse(text); } catch { body = { raw: text }; }
  }
  return { response, body };
}

function printResult(label, response, body) {
  const safeBody = body && typeof body === 'object' ? { ...body } : body;
  if (safeBody && typeof safeBody === 'object') {
    delete safeBody.accessToken;
    delete safeBody.refreshToken;
  }
  console.log(`${label}: ${response.status} ${response.statusText}${safeBody ? ` ${JSON.stringify(safeBody)}` : ''}`);
}

function requireStatus(label, result, expected) {
  printResult(label, result.response, result.body);
  if (result.response.status !== expected) {
    throw new Error(`${label} beklenen HTTP ${expected}, alınan ${result.response.status}`);
  }
}

try {
  const login = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  requireStatus('login', login, 200);

  if (typeof login.body?.accessToken !== 'string' || !cookies.has('refreshToken')) {
    throw new Error('Login başarılı görünse de access token veya refreshToken cookie bulunamadı');
  }
  let accessToken = login.body.accessToken;
  console.log(`cookie jar: refreshToken bulundu (toplam ${cookies.size} cookie)`);

  const meAfterLogin = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  requireStatus('/auth/me (login sonrası)', meAfterLogin, 200);

  const refresh = await request('/api/auth/refresh', { method: 'POST' });
  requireStatus('refresh', refresh, 200);
  if (typeof refresh.body?.accessToken !== 'string' || !cookies.has('refreshToken')) {
    throw new Error('Refresh başarılı görünse de yeni access token veya refresh cookie bulunamadı');
  }
  accessToken = refresh.body.accessToken;

  const meAfterRefresh = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  requireStatus('/auth/me (refresh sonrası)', meAfterRefresh, 200);

  const logout = await request('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  requireStatus('logout', logout, 200);

  const refreshAfterLogout = await request('/api/auth/refresh', { method: 'POST' });
  requireStatus('refresh (logout sonrası)', refreshAfterLogout, 401);

  console.log('Auth cookie akışı başarılı.');
} catch (error) {
  console.error(`Auth testi başarısız: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
