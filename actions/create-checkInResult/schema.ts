import { z } from "zod";

export const CreateCheckInResult = z.object({
  userId: z.number(),
  branch: z.string(),
  addedStar: z.number(),
});
