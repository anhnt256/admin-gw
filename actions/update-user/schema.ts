import { z } from "zod";

export const UpdateUser = z.object({
  id: z.number(),
  rankId: z.optional(z.number()),
  magicStone: z.optional(z.number()),
  userId: z.number(),
  stars: z.optional(z.number()),
  branch: z.optional(z.string()),
  userName: z.optional(z.string()),
  mission: z.optional(
    z.object({
      startHours: z.number(),
      endHours: z.number(),
      quantity: z.number(),
      type: z.string(),
    }),
  ),
});
