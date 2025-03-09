"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateUser } from "./schema";
import { InputType, ReturnType } from "./type";
import { User } from "@/prisma/generated/prisma-client";
import { BRANCH } from "@/constants/enum.constant";
import dayjs from "dayjs";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, rankId = 1, branch = BRANCH.GOVAP, stars = 0 } = data;

  let createUser;
  let currentUser: User | null;

  try {
    currentUser = await db.user.findFirst({
      where: { userId, branch },
    });
  } catch (error: any) {
    return {
      error: error.message,
    };
  }

  if (currentUser) {
    return {
      error: "User has exist.",
    };
  }

  try {
    createUser = await db.user.create({
      data: {
        userId,
        branch,
        rankId,
        stars,
        createdAt: dayjs()
          .tz("Asia/Ho_Chi_Minh")
          .add(7, "hours")
          .toISOString(),
      },
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: createUser };
};

export const createUser = createSafeAction(CreateUser, handler);
