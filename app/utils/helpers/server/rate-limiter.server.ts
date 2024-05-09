import { env } from "~/env";
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";

const client = new Redis({
  host: env.UPSTASH_REDIS_URL,
  port: env.UPSTASH_REDIS_PORT,
  password: env.UPSTASH_REDIS_PASSWORD,
  username: "default",
  family: 6,
});

client.on("error", (error) => {
  console.error(error);
});

export const getRateLimiter = (tokens = 1, window: number) => {
  return new RateLimiterRedis({
    storeClient: client,
    points: tokens,
    duration: window,
  });
};
