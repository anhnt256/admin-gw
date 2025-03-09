import { z } from "zod";
import { CheckInResult } from "@/prisma/generated/prisma-client";

import { ActionState } from "@/lib/create-safe-action";

import { CreateCheckInResult } from "./schema";

export type InputType = z.infer<typeof CreateCheckInResult>;
export type ReturnType = ActionState<InputType, CheckInResult>;
