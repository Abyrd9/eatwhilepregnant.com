import { LRUCache as LRU } from "lru-cache";

type RateLimiterOptions = {
  points: number;
  duration: number;
  maxEntries?: number;
};

type RateLimitCacheEntry = {
  points: number;
  resetTime: number;
};

type RateLimitConsumeResult = {
  remainingPoints: number;
  msBeforeNext: number;
};

class RateLimiter {
  private points: number;
  private duration: number;
  private cache: LRU<string, RateLimitCacheEntry>;

  constructor(options: RateLimiterOptions) {
    this.points = options.points;
    this.duration = options.duration;
    this.cache = new LRU<string, RateLimitCacheEntry>({
      max: options.maxEntries || 5000,
      ttl: this.duration * 1000,
      updateAgeOnGet: false,
      allowStale: false,
    });
  }

  async consume(key: string): Promise<RateLimitConsumeResult> {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (entry && now < entry.resetTime) {
      if (entry.points <= 0) {
        return Promise.reject({ msBeforeNext: entry.resetTime - now });
      }
      entry.points -= 1;
      this.cache.set(key, entry);
      return {
        remainingPoints: entry.points,
        msBeforeNext: entry.resetTime - now,
      };
    } else {
      const newEntry: RateLimitCacheEntry = {
        points: this.points - 1,
        resetTime: now + this.duration * 1000,
      };
      this.cache.set(key, newEntry);
      return {
        remainingPoints: newEntry.points,
        msBeforeNext: this.duration * 1000,
      };
    }
  }

  getMetrics() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      memoryUsage: this.cache.calculatedSize,
    };
  }
}

const limiters: Record<string, RateLimiter> = {};

export const getRateLimiter = (
  name: string,
  points: number,
  duration: number,
  maxEntries?: number
): RateLimiter => {
  if (!limiters[name]) {
    const limiter = new RateLimiter({ points, duration, maxEntries });
    limiters[name] = limiter;
    return limiter;
  }
  return limiters[name];
};

export const RateLimiterResponse = (
  message: string,
  init: Omit<ResponseInit, "status">,
  retryAfter: number
) =>
  new Response(message, {
    ...init,
    status: 429,
    headers: { "Retry-After": String(retryAfter), ...init.headers },
  });

export const checkRateLimit = async (
  request: Request,
  limiterName: string
): Promise<RateLimitConsumeResult> => {
  const rateLimiter = limiters[limiterName];
  if (!rateLimiter) {
    throw new Error(
      `Rate limiter "${limiterName}" not found. Make sure to create it first.`
    );
  }

  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  try {
    return await rateLimiter.consume(clientIP);
  } catch (rejRes: unknown) {
    throw RateLimiterResponse(
      "Too Many Requests",
      {},
      Math.ceil((rejRes as RateLimitConsumeResult).msBeforeNext / 1000)
    );
  }
};

export const getAllMetrics = () => {
  const metrics: Record<string, ReturnType<RateLimiter["getMetrics"]>> = {};
  for (const [name, limiter] of Object.entries(limiters)) {
    metrics[name] = limiter.getMetrics();
  }
  return metrics;
};
