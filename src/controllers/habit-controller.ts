import { Context } from "hono";
import { habit } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HabitSchema } from "../db/validation/habit-zod";

export async function createHabit(c: Context) {
  const body = await c.req.json();
  try {
    const {
      name,
      icon,
      goalValue,
      goalUnit,
      reminderEnabled,
      reminderTime,
      schedule,
    } = HabitSchema.parse(body);

    if (!name || !goalValue || !goalUnit || !reminderEnabled) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const db = drizzle(c.env.DB);
    const newHabit = await db.insert(habit).values({
      name,
      icon,
      goalValue,
      goalUnit,
      reminderEnabled,
      reminderTime,
      schedule
    }).returning();

    return c.json({ added: newHabit[0] }, 201);

  } catch (error) {
    console.error("Error adding habit", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}
