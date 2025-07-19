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
      userId,
      icon,
      goalValue,
      goalUnit,
      reminderEnabled,
      reminderTime,
      schedule,
    } = HabitSchema.parse(body);

    if (!name || !userId || !goalValue || !goalUnit || !schedule) {
      return c.json({ error: "Missing required field(s)" }, 400);
    }

    const db = drizzle(c.env.DB);
    const newHabit = await db.insert(habit).values({
      name,
      userId,
      icon,
      goalValue,
      goalUnit,
      reminderEnabled,
      reminderTime,
      schedule
    }).returning();

    return c.json({ added: newHabit[0] }, 201);

  } catch (error) {
    console.error("Error creating habit", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}

export async function deleteHabit(c: Context) {
  const { id } = c.req.param();
  try {
    const db = drizzle(c.env.DB);
    const deletedHabit = await db
      .delete(habit)
      .where(
        eq(habit.id, parseInt(id))
      )
      .returning();

    if (deletedHabit.length === 0) {
      return c.json({ error: `Habit id:${id} not found. No habit deleted.` }, 404);
    }

    return c.json({ deleted: deletedHabit[0] }, 200)

  } catch (error) {
    console.error("Error deleting habit", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}

export async function getUserHabits(c: Context) {
  const { userId } = c.req.param();
  try {
    const db = drizzle(c.env.DB);
    const userHabits = await db
      .select()
      .from(habit)
      .where(
        eq((habit.userId), parseInt(userId))
      );

    return c.json(userHabits, 200);

  } catch (error) {
    console.error("Error getting user habits", error);
    return c.json({ error: "Something went wrong" }, 500);
  }
}
