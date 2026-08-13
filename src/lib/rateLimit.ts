type Bucket = {
    count: number;
    resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return false;
    }

    if (bucket.count >= limit) {
        return true;
    }

    bucket.count += 1;
    return false;
}

export function getRequestIp(
  forwardedFor?: string | null,
  realIp?: string | null,
  cfConnectingIp?: string | null
) {
  const candidates = [
    forwardedFor?.split(',')[0]?.trim(),
    realIp,
    cfConnectingIp,
  ];

  for (const candidate of candidates) {
    if (candidate && candidate !== 'unknown' && candidate.toLowerCase() !== 'localhost') {
      return candidate;
    }
  }

  return 'unknown';
}
