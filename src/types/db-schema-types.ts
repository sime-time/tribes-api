import { z } from "zod/v4";

export const FavoriteSchema = z.object({
  userId: z.coerce.number().min(0),
  recipeId: z.coerce.number().min(0),
  title: z.string().min(1),
  image: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),
});
export type FavoriteSchemaType = z.infer<typeof FavoriteSchema>;
