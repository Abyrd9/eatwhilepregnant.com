import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Copied from the @upstash/ratelimit package
type Unit = "ms" | "s" | "m" | "h" | "d";
type Duration = `${number} ${Unit}` | `${number}${Unit}`;

export const getRateLimiter = (tokens = 1, window: Duration = "1 s") =>
  new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
  });
