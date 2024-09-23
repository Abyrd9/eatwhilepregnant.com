import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  runtimeEnv: process.env,
  server: {
    // Anthropic
    ANTHROPIC_API_KEY: z.string().min(1),

    // DB
    DATABASE_URL: z.string().min(1),
    DATABASE_ENCRYPTION_KEY: z.string().min(1),

    // Turso Sync DB
    TURSO_DATABASE_SYNC_URL: z.string().min(1),
    TURSO_DATABASE_TOKEN: z.string().min(1),

    // Cloudflare
    CLOUDFLARE_API_TOKEN: z.string().min(1),

    // Cookies
    GENERIC_SESSION_SECRET: z.string().min(1),
  },
});
