import { z } from "zod";

export const CreateUser = z.object({
  userId: z.number(),
  rankId: z.optional(z.number()),
  branch: z.string(),
  stars: z.number(),
  createdAt: z.string(),
});
