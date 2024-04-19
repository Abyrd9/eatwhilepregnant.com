import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { env } from "~/env";

const sqlite = new Database(env.DATABASE_URL);
export const db = drizzle(sqlite, {
  schema,
});

void migrate(db, {
  migrationsFolder: "app/drizzle/migrations",
  migrationsTable: "drizzle_migrations",
});
