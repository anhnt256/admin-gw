import { z } from "zod";
import { UserMissionMap } from "@/prisma/generated/prisma-client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdateUserMissionMap } from "./schema";

export type InputType = z.infer<typeof UpdateUserMissionMap>;
export type ReturnType = ActionState<InputType, UserMissionMap>;
