import type { NextResponse } from 'next/server';

const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/auth', maxAge: 7 * 24 * 60 * 60 };

export function setRefreshCookie(response: NextResponse, token: string): void { response.cookies.set('refreshToken', token, options); }
export function clearRefreshCookie(response: NextResponse): void { response.cookies.set('refreshToken', '', { ...options, maxAge: 0 }); }
export function refreshCookieOptions() { return options; }
