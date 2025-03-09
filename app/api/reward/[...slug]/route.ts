import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  try {

    const [userId, branch] = params.slug;

    if (userId) {
      const rewards = await db.userRewardMap.findMany({
        where: { userId: parseInt(userId, 10), branch },
        include: {
          promotionCode: {
            select: { code: true, name: true },
            where: { isUsed: true },
          },
        },
      });

      return NextResponse.json(rewards);
    }
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
