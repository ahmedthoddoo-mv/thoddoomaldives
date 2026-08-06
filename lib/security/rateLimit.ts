type RateLimitInput = {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const attemptsByKey = new Map<string, number[]>();

export function checkRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const compoundKey = `${input.bucket}:${input.key}`;
  const recentAttempts = (attemptsByKey.get(compoundKey) ?? []).filter(
    (timestamp) => now - timestamp < input.windowMs
  );

  if (recentAttempts.length >= input.limit) {
    const oldestTimestamp = recentAttempts[0] ?? now;
    const retryAfterMs = Math.max(0, input.windowMs - (now - oldestTimestamp));
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  attemptsByKey.set(compoundKey, [...recentAttempts, now]);
  return { allowed: true, retryAfterSeconds: 0 };
}
