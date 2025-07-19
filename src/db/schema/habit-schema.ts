import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const habit = sqliteTable("habit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon"),

  // Goal tracking
  goalValue: integer("goal_value").notNull(),
  goalUnit: text("goal_unit").notNull(),

  // Flexible scheduling
  // e.g. { "type": "daily" }
  // or { "type": "weekly", "days": [1,3,5] }
  schedule: text("schedule", { mode: "json" }).notNull(),

  // Reminder settings
  reminderEnabled: integer("reminder_enabled", { mode: "boolean" }).default(false).notNull(),
  reminderTime: text("reminder_time"), // e.g. "09:00"

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});
