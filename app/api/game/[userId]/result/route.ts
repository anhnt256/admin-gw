import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCookie } from "cookies-next";
import { Prisma } from "@/prisma/generated/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = params;
  if (!userId) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    const query = Prisma.sql`
      SELECT gr.*, i.title, i.value, ush.oldStars, ush.newStars
      FROM GameResult gr
             INNER JOIN Item i ON gr.itemId = i.id
             INNER JOIN UserStarHistory ush ON gr.userId = ush.userId AND ush.targetId = gr.id
      WHERE gr.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      AND gr.userId = ${parseInt(userId, 10)}
      ORDER BY gr.createdAt DESC, ush.newStars DESC
  `;

    const gameResults = await db.$queryRaw(query);

    return NextResponse.json(gameResults);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
