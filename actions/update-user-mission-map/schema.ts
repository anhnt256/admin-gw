import { z } from "zod";

export const UpdateUserMissionMap = z.object({
  id: z.number(),
  userId: z.number(),
  currentUserId: z.number(),
  reward: z.number(),
  isDone: z.boolean(),
  updatedAt: z.string(),
  branch: z.string(),
});
