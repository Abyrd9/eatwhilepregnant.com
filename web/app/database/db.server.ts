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

    if (import.meta.env.DEV) {
      console.log("Seeding database...");
      await db.delete(schema.documents).execute();
      await db.insert(schema.documents).values([
        {
          search: "watermelon",
          content: "Watermelon is a fruit that is safe to eat while pregnant.",
          is_safe: "1",
          slug: "can-i-eat-watermelon-while-pregnant",
        },
        {
          search: "water",
          content: "Water is a liquid that is safe to drink while pregnant.",
          is_safe: "1",
          slug: "can-i-eat-water-while-pregnant",
        },
        {
          search: "water chestnut",
          content:
            "Water Chestnut is a root that is safe to eat while pregnant.",
          is_safe: "1",
          slug: "can-i-eat-water-chestnut-while-pregnant",
        },
        {
          search: "pineapple",
          content: "Pineapple is a fruit that is safe to eat while pregnant.",
          is_safe: "1",
        },
      ]);
      console.log("Database seeded!");
    }
  } catch (error) {
    throw new Error(`Error migrating database: ${error}`);
  }
})();
