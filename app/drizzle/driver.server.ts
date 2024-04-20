import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database(
  process.env.NODE_ENV === "production"
    ? "../../data/sqlite.db" // Have to do this stupid relative path shit for production
    : "data/sqlite.db"
);
export const db = drizzle(sqlite, {
  schema,
});

migrate(db, {
  migrationsFolder: "app/drizzle/migrations",
  migrationsTable: "drizzle_migrations",
});
