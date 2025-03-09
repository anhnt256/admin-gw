import { z } from "zod";
import { UserRewardMap } from "@/prisma/generated/prisma-client";

import { ActionState } from "@/lib/create-safe-action";

import { CreateUserRewardMap } from "./schema";

export type InputType = z.infer<typeof CreateUserRewardMap>;
export type ReturnType = ActionState<InputType, UserRewardMap>;
