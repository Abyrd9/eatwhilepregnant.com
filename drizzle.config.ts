import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/drizzle/schema.ts",
  out: "./app/drizzle/migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url:
      process.env.NODE_ENV === "production"
        ? "file:///data/sqlite.db"
        : "data/sqlite.db",
  },
  verbose: true,
});
