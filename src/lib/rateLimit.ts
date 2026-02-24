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

export function getRequestIp(forwardedFor?: string | null) {
    if (!forwardedFor) return 'unknown';
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
}
