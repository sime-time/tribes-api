import { z } from "zod/v4";

export const HabitSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  goalValue: z.coerce.number().min(0),
  goalUnit: z.string().min(1),
  schedule: z.object({
    type: z.string().min(1), // "daily", "weekly", or "monthly"
    days: z.array(z.number()).optional(),
  }),
  reminderEnabled: z.boolean().default(false),
  reminderTime: z.string().optional(),
});
export type HabitSchemaType = z.infer<typeof HabitSchema>;
