import { z } from "zod";

export const CreateGameResult = z.object({
  userId: z.number(),
  currentUserId: z.number(),
  branch: z.string(),
  rolls: z.number(),
});
