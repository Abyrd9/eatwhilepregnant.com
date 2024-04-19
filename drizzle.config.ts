import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/drizzle/schema.ts",
  out: "./app/drizzle/migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: "sqlite.db",
  },
});
