import { z } from "zod";

export const CreateUserRewardMap = z.object({
  userId: z.number(),
  currentUserId: z.number(),
  rewardId: z.number(),
  value: z.number(),
  oldStars: z.number(),
  newStars: z.number(),
  branch: z.optional(z.string()),
  promotionCodeId: z.optional(z.number()),
  duration: z.optional(z.number()),
  isUsed: z.optional(z.boolean()),
  createdAt: z.string(),
});
