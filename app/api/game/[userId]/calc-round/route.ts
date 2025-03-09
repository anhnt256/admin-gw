import { NextResponse } from "next/server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { Prisma } from "@/prisma/generated/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params;

    const fnetDB = getFnetDB();
    const fnetPrisma = getFnetPrisma();

    const fnetQuery = fnetPrisma.sql`
      SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
      FROM fnet.paymenttb
      WHERE PaymentType = 4
        AND UserId = ${parseInt(userId, 10)}
        AND Note = N'Thời gian phí'
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= DATE(NOW()) - INTERVAL 30 DAY
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= NOW()
    `;

    const result = await fnetDB.$queryRaw<[{ total: number }]>(fnetQuery);

    const userTopUp = parseFloat(result[0].total.toString());

    // const userTopUp = 500000;

    const round = Math.floor(
      userTopUp
        ? userTopUp / Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND)
        : 0,
    );

    // Số lượt đã sử dụng
    const query = Prisma.sql`
                      SELECT COUNT(*) as count
                      FROM GameResult gr
                      WHERE gr.userId = ${parseInt(userId, 10)}
                      AND CreatedAt >= DATE(NOW()) - INTERVAL 30 DAY
                      AND CreatedAt <= NOW();
                    `;

    const userRound = await db.$queryRaw<[{ count: bigint }]>(query);

    const count = Number(userRound[0].count);

    const user = await db.user.findFirst({
      where: { userId: parseInt(userId, 10) },
    });

    const { id } = user || {};

    if (id) {
      if (round - count >= 0) {
        await db.user.update({
          where: { id },
          data: { magicStone: round - count },
        });
      }
      return NextResponse.json("Success", { status: 200 });
    }
    return NextResponse.json("Internal Error", { status: 404 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
