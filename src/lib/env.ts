const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

/** The API address is public configuration, never a credential. */
export const API_URL = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : '';

export function requireApiUrl(): string {
  if (!API_URL) {
    throw new Error('API adresi yapılandırılmamış. NEXT_PUBLIC_API_URL değerini ayarlayın.');
  }
  return API_URL;
}
