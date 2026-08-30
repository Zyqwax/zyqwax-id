type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000;

/** Best effort per warm Vercel instance. Use distributed storage before high-volume production. */
export function checkRateLimit(key: string, limit: number, windowMs = WINDOW_MS): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) for (const [bucketKey, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(bucketKey);
    return { allowed: true, retryAfter: windowMs / 1000 };
  }
  current.count += 1;
  return { allowed: current.count <= limit, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}
