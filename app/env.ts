import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  runtimeEnv: process.env,
  server: {
    ANTHROPIC_API_KEY: z.string().min(1),
    UPSTASH_REDIS_URL: z.string().min(1),
    UPSTASH_REDIS_PORT: z.coerce.number(),
    UPSTASH_REDIS_PASSWORD: z.string().min(1),
    TURSO_DB_URL: z.string().min(1),
    TURSO_DB_TOKEN: z.optional(z.string().min(1)),
    GENERIC_SESSION_SECRET: z.string().min(1),
  },
});
