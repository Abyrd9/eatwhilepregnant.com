import type { Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./app/database/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_DB_TOKEN,
  },
} satisfies Config;
