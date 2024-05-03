import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env";

// Copied from the @upstash/ratelimit package
type Unit = "ms" | "s" | "m" | "h" | "d";
type Duration = `${number} ${Unit}` | `${number}${Unit}`;

export const getRateLimiter = (tokens = 1, window: Duration = "1 s") =>
  new Ratelimit({
    redis: new Redis({
      url: env.UPSTASH_REDIS_URL,
      token: env.UPSTASH_REDIS_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
  });
