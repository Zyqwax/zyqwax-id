import { NextRequest } from 'next/server';
import { authorizeQuerySchema } from '@/lib/server/validation';
import { authorizeUser } from '@/lib/server/oauth-service';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const limit = checkRateLimit(`oauth:${clientKey(request)}`, 50);
  if (!limit.allowed) return rateLimited(limit.retryAfter);
  const parsed = authorizeQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return errorResponse(parsed.error);
  try { return await authorizeUser(request, parsed.data); }
  catch (error) { return errorResponse(error); }
}
