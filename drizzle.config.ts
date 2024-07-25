import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  dialect: "sqlite",
  schema: "./app/drizzle/schema.ts",
  out: "./app/drizzle/migrations",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_TOKEN,
  },
  verbose: true,
} satisfies Config;
