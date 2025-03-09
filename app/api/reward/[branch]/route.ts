import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { branch: string } },
) {
  try {
    const rewards: any = await db.reward.findMany();

    if (rewards.length > 0) {
      await Promise.all(
        rewards.map(async (reward: any, index: number) => {
          const { value } = reward;
          rewards[index].totalPromotion = await db.promotionCode.count({
            where: {
              value: value,
              isUsed: false,
              branch: params.branch,
            },
          });
        }),
      );
    }

    return NextResponse.json(rewards);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
