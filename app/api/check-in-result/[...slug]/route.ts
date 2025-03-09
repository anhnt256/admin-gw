import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import dayjs from "@/lib/dayjs";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  const now = dayjs();
  const startOfMonth = now.startOf("month");
  const endOfMonth = now.endOf("month");

  const [userId, branch] = params.slug;

  try {
    const checkInItems = await db.userStarHistory.findMany({
      where: {
        userId: parseInt(userId, 10),
        branch,
        type: "CHECK_IN",
        createdAt: {
          gte: startOfMonth.toISOString(),
          lte: endOfMonth.toISOString(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(checkInItems);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
