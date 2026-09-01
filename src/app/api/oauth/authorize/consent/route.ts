import { NextRequest } from 'next/server';
import { ServiceError } from '@/lib/server/auth-service';
import { resolveConsent } from '@/lib/server/oauth-service';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { clientKey, errorResponse, rateLimited, requireSameOrigin } from '@/lib/server/route-utils';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`oauth-consent:${clientKey(request)}`, 20);
  if (!limit.allowed) return rateLimited(limit.retryAfter);
  try {
    requireSameOrigin(request);
    const form = await request.formData();
    const token = form.get('request');
    const action = form.get('action');
    if (typeof token !== 'string' || !token || (action !== 'approve' && action !== 'deny')) {
      throw new ServiceError(400, 'geçersiz onay isteği');
    }
    return await resolveConsent(token, action);
  } catch (error) { return errorResponse(error); }
}
