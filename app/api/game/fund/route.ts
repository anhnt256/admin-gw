import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import dayjs from "@/lib/dayjs";

export async function GET() {
  try {
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

    const ROUND_COST = 30000; // 30000 một vòng quay
    const RATE = 0.015; // 1.5%

    const totalAmount = totalRound * ROUND_COST * RATE;
    return NextResponse.json(totalAmount);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
