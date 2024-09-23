import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "~/env";
import * as schema from "./schema";

export const db = drizzle(
  createClient({
    url: env.DATABASE_URL,
    syncUrl: env.TURSO_DATABASE_SYNC_URL,
    authToken: env.TURSO_DATABASE_TOKEN,
    syncInterval: 15,
    encryptionKey: env.DATABASE_ENCRYPTION_KEY,
  }),
  { schema }
);

// Run migrations on server start
(async () => {
  try {
    console.log("Migrating database...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database migrated!");
  } catch (error) {
    throw new Error(`Error migrating database: ${error}`);
  }
})();
