import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_TOKEN,
});

export const db = drizzle(client, {
  schema,
});

migrate(db, {
  migrationsFolder: "app/drizzle/migrations",
  migrationsTable: "drizzle_migrations",
});
