import type { Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./app/database/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: env.TURSO_DATABASE_SYNC_URL,
    authToken: env.TURSO_DATABASE_TOKEN,
  },
} satisfies Config;
