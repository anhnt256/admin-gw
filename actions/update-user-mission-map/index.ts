"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateUserMissionMap } from "./schema";
import { InputType, ReturnType } from "./type";
import dayjs from "dayjs";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    id,
    isDone = true,
    updatedAt = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .add(7, "hours")
      .toISOString(),
    userId,
    currentUserId,
    reward,
    branch,
  } = data;
  let updateUserMissionMap;
  let updateUser;

  const currentMissions = await db.userMissionMap.findFirst({
    where: { id, isDone: true },
  });

  if (currentMissions) {
    return {
      error: "Reward has claim.",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      updateUserMissionMap = await tx.userMissionMap.update({
        where: {
          id,
        },
        data: {
          isDone,
          updatedAt,
        },
      });
      if (updateUserMissionMap) {
        const user = await tx.user.findUnique({
          where: { id: currentUserId, branch },
        });

        if (user) {
          const { stars: oldStars } = user;

          const newStars = oldStars + reward;

          updateUser = await tx.user.update({
            where: {
              id: currentUserId,
            },
            data: {
              stars: newStars,
              updatedAt,
            },
          });

          await tx.userStarHistory.create({
            data: {
              userId,
              type: "MISSION",
              oldStars,
              newStars,
              targetId: id,
              createdAt: dayjs()
                .tz("Asia/Ho_Chi_Minh")
                .add(7, "hours")
                .toISOString(),
              branch,
            },
          });
        }
      }
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: updateUserMissionMap };
};

export const updateUserMissionMap = createSafeAction(
  UpdateUserMissionMap,
  handler,
);
