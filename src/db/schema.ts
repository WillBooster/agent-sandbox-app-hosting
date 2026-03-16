import { blob, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const app = sqliteTable("app", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});

export const appFile = sqliteTable(
  "app_file",
  {
    id: text("id").primaryKey(),
    appId: text("app_id")
      .notNull()
      .references(() => app.id),
    path: text("path").notNull(),
    content: blob("content", { mode: "buffer" }).notNull(),
    mimeType: text("mime_type").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [uniqueIndex("app_file_app_id_path_unique").on(table.appId, table.path)],
);
