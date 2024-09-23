import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const documents = sqliteTable(
  "documents",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    search: text("search"),
    content: text("content"),
    is_safe: text("is_safe", { enum: ["1", "2", "3", "4"] as const }),
    slug: text("slug"),
    created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    searchIdx: index("search_idx").on(table.search),
  })
);

export const versions = sqliteTable("versions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["create", "update", "delete"] }).notNull(),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const feedback = sqliteTable("feedback", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  document_id: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  food: text("food"),
  feedback: text("content"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const feedback_relations = relations(feedback, ({ one }) => ({
  document: one(documents, {
    fields: [feedback.document_id],
    references: [documents.id],
  }),
}));
