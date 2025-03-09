import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCookie } from "cookies-next";
import { Prisma } from "@/prisma/generated/prisma-client";

export async function GET(req: Request) {
  try {
    const query = Prisma.sql`
      SELECT gr.*, i.title, i.value,
             CONCAT(SUBSTRING(u.userName, 1, LENGTH(u.userName)-3), '***') as maskedUsername,
             ush.oldStars,
             ush.newStars
      FROM GameResult gr
             INNER JOIN Item i ON gr.itemId = i.id
             INNER JOIN User u ON gr.userId = u.userId
             INNER JOIN UserStarHistory ush ON gr.userId = ush.userId AND ush.targetId = gr.id
      WHERE gr.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY gr.createdAt DESC, ush.newStars DESC
  `;
    const gameResults = await db.$queryRaw(query);

    return NextResponse.json(gameResults);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
