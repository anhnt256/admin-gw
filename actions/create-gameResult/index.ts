"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { GameItemResults, InputType, ReturnType } from "./type";
import { CreateGameResult } from "@/actions/create-gameResult/schema";
import { Item } from "@/prisma/generated/prisma-client";
import { patchConsoleError } from "next/dist/client/components/react-dev-overlay/internal/helpers/hydration-error-info";
import dayjs from "dayjs";

const UP_RATE = 0.5;
const ROUND_COST = 30000; // 30000 một vòng quay
const RATE = 0.015; // 1.5%
const UP_RATE_AMOUNT = 500000;
const JACKPOT_ID = 8;

const ITEM_RATE_DEFAULT = [
  { id: 1, rating: 53.0 },
  { id: 2, rating: 20.0 },
  { id: 3, rating: 10.0 },
  { id: 4, rating: 7.0 },
  { id: 5, rating: 5.0 },
  { id: 6, rating: 3.0 },
  { id: 7, rating: 2.0 },
  { id: 8, rating: 0 },
];

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, currentUserId, branch, rolls } = data;

  let resultFilters: GameItemResults[] = [];

  try {
    const currentUser = await db.user.findUnique({
      where: {
        id: currentUserId,
        branch,
      },
    });

    if (!currentUser) {
      return {
        error: "User not found",
      };
    }

    const { magicStone = 0 } = currentUser ?? {};

    if (magicStone - rolls < 0) {
      return {
        error: "Bạn không đủ đá năng lượng. Hãy quay lại sau nhé.",
      };
    }

    const lastJackPotDate = await db.gameResult.findFirst({
      where: {
        itemId: 8,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalRound = await db.gameResult.count({
      where: {
        ...(lastJackPotDate?.createdAt && {
          createdAt: {
            gt: lastJackPotDate.createdAt,
          },
        }),
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const totalFund = totalRound * ROUND_COST * RATE;

    await db.$transaction(
      async (tx) => {
        const results = [];

        // Thực hiện số lần quay yêu cầu
        for (let i = 0; i < rolls; i++) {
          // Get fresh itemRate data for each roll
          const itemRate = await tx.item.findMany();

          const random = Math.random() * 100;
          let cumulativeProbability = 0;

          for (let j = 0; j < itemRate.length; j++) {
            cumulativeProbability += itemRate[j].rating;
            if (random < cumulativeProbability) {
              const isJackpot = itemRate[j].id === JACKPOT_ID;

              let addedStar = itemRate[j].value;

              // Add result
              if (isJackpot) {
                addedStar = totalFund;
                results.push({
                  ...itemRate[j],
                  value: totalFund,
                });
              } else {
                results.push(itemRate[j]);
              }

              // Update ratings and get fresh rates
              await updateRating(itemRate, totalFund, tx, isJackpot);
              await saveResult(userId, branch, tx, itemRate[j].id, addedStar);
              break;
            }
          }
        }

        resultFilters = results.map((item) => ({
          id: item.id,
          image_url: item.image_url,
          title: item.title,
          value: item.value,
        }));

        return { data: resultFilters };
      },
      {
        timeout: 60000, // 30 seconds timeout for handling multiple rolls
      },
    );
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  return { data: resultFilters };
};

async function updateRating(
  itemRate: Item[],
  totalFund: number,
  tx: any,
  isJackpot: boolean,
) {
  if (isJackpot) {
    for (const item of ITEM_RATE_DEFAULT) {
      await tx.item.update({
        where: {
          id: item.id,
        },
        data: {
          rating: item.rating,
        },
      });
    }
    return;
  }
  // Update rate every user roll
  if (totalFund >= UP_RATE_AMOUNT) {
    // Tìm item Galactic Jackpot
    const jackpotItem = itemRate.find((item) => item.id === JACKPOT_ID);

    if (jackpotItem) {
      jackpotItem.rating += UP_RATE; // Tăng tỷ lệ ô 8 thêm 0.1%

      // Tính toán giảm tỷ lệ cho các ô khác
      const totalRatingReduction = UP_RATE;
      const otherItems = itemRate.filter((item) => item.id !== JACKPOT_ID);
      const reductionPerItem = totalRatingReduction / otherItems.length;

      otherItems.forEach((item) => {
        item.rating -= reductionPerItem;
      });
    }

    for (const item of itemRate) {
      await tx.item.update({
        where: {
          id: item.id,
        },
        data: {
          rating: item.rating,
        },
      });
    }
  }
}

async function saveResult(
  userId: any,
  branch: any,
  tx: any,
  id: any,
  addedStar: any,
) {
  const user = await tx.user.findFirst({
    where: { userId, branch },
  });

  if (user) {
    const { stars: oldStars, magicStone } = user;

    const newStars = oldStars + addedStar;

    const { id: gameResultId } = await tx.gameResult.create({
      data: {
        userId,
        itemId: id,
        createdAt: dayjs()
          .tz("Asia/Ho_Chi_Minh")
          .add(7, "hours")
          .toISOString(),
      },
    });

    await tx.userStarHistory.create({
      data: {
        userId,
        type: "GAME",
        oldStars,
        newStars,
        targetId: gameResultId,
        createdAt: dayjs()
          .tz("Asia/Ho_Chi_Minh")
          .add(7, "hours")
          .toISOString(),
        branch,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        stars: newStars,
        updatedAt: dayjs()
          .tz("Asia/Ho_Chi_Minh")
          .add(7, "hours")
          .toISOString(),
        magicStone: magicStone - 1,
      },
    });
  }
}

export const createGameResult = createSafeAction(CreateGameResult, handler);
