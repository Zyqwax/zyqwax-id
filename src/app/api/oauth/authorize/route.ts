import { NextRequest } from 'next/server';
import { authorizeQuerySchema } from '@/lib/server/validation';
import { authorizeUser } from '@/lib/server/oauth-service';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const limit = checkRateLimit(`oauth:${clientKey(request)}`, 50);
  if (!limit.allowed) return rateLimited(limit.retryAfter);
  // Next.js'in _rsc gibi dahili parametreleri OAuth şemasını etkilemesin.
  const allowedKeys = ['client_id', 'redirect_uri', 'response_type', 'scope', 'state', 'code_challenge', 'code_challenge_method'];
  const query = Object.fromEntries(allowedKeys.flatMap((key) => {
    const value = request.nextUrl.searchParams.get(key);
    return value === null ? [] : [[key, value]];
  }));
  const parsed = authorizeQuerySchema.safeParse(query);
  if (!parsed.success) return errorResponse(parsed.error);
  try { return await authorizeUser(request, parsed.data); }
  catch (error) { return errorResponse(error); }
}
