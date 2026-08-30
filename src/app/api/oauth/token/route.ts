import { NextRequest } from 'next/server';
import { tokenBodySchema } from '@/lib/server/validation';
import { exchangeAuthorizationCode } from '@/lib/server/oauth-service';
import { clientKey, errorResponse, rateLimited } from '@/lib/server/route-utils';
import { checkRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

async function readBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) return Object.fromEntries((await request.formData()).entries());
  return await request.json();
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`oauth-token:${clientKey(request)}`, 5);
  if (!limit.allowed) return rateLimited(limit.retryAfter);
  try {
    const parsed = tokenBodySchema.safeParse(await readBody(request));
    if (!parsed.success) return errorResponse(parsed.error);
    const result = await exchangeAuthorizationCode(parsed.data);
    return Response.json(result);
  } catch (error) { return errorResponse(error); }
}
