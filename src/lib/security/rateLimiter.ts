import { PINK_DROP_CONFIG } from "@/lib/config";

type Bucket = {
  timestamps: number[];
};

declare global {
  var __biodanceRateLimitBuckets: Map<string, Bucket> | undefined;
}

function getBuckets(): Map<string, Bucket> {
  if (!globalThis.__biodanceRateLimitBuckets) {
    globalThis.__biodanceRateLimitBuckets = new Map();
  }
  return globalThis.__biodanceRateLimitBuckets;
}

/**
 * Simple fixed-window in-memory rate limiter, per key (IP). Fine for a
 * single always-on Node process on a LAN kiosk — no need for a shared
 * store since there is only ever one server instance.
 */
export function checkRateLimit(key: string): { allowed: boolean } {
  const buckets = getBuckets();
  const now = Date.now();
  const windowStart = now - PINK_DROP_CONFIG.rateLimit.windowMs;

  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= PINK_DROP_CONFIG.rateLimit.maxRequestsPerWindow) {
    buckets.set(key, bucket);
    return { allowed: false };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup so the map doesn't grow unbounded over a long event.
  if (buckets.size > 500) {
    for (const [k, b] of buckets) {
      if (b.timestamps.every((t) => t <= windowStart)) {
        buckets.delete(k);
      }
    }
  }

  return { allowed: true };
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return "local";
}
