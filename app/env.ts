import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  runtimeEnv: process.env,
  server: {
    OPEN_AI_API_KEY: z.string().min(1),
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string().min(1),
  },
});
