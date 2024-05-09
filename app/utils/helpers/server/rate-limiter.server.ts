import { env } from "~/env";
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";

const client = new Redis(env.UPSTASH_REDIS_URL);

export const getRateLimiter = (tokens = 1, window: number) => {
  return new RateLimiterRedis({
    storeClient: client,
    points: tokens,
    duration: window,
  });
};
