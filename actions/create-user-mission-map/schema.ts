import { z } from "zod";

export const CreateUserMissionMap = z.array(
  z.object({
    userId: z.number(),
    missionId: z.number(),
    branch: z.string(),
    createdAt: z.string(),
  }),
);
