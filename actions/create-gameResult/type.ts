import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";

import { CreateGameResult } from "./schema";

export type GameItemResults = {
  id: number,
  image_url: string;
  title: string;
  value: number;
};

export type InputType = z.infer<typeof CreateGameResult>;
export type ReturnType = ActionState<InputType, GameItemResults[]>;
