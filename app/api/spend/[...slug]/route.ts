import { NextResponse } from "next/server";

import { getFnetDB } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  try {
    const fnetDB = getFnetDB();
    const [userId, branch] = params.slug;
    const status = 3;

    let result: any;

    if (userId) {
      const todayData: any = await fnetDB.$queryRaw`
      SELECT *
      FROM fnet.systemlogtb
      WHERE UserId = ${userId} AND status = ${status} AND DATE(STR_TO_DATE(CONCAT(EnterDate, ' ', EnterTime), '%Y-%m-%d %H:%i:%s')) = CURDATE()
    `;
      if (todayData.length > 0) {
        result = todayData;
      } else {
        result = await fnetDB.$queryRaw`
          SELECT *
          FROM fnet.systemlogtb
          WHERE UserId = ${userId}
            AND status = ${status}
            AND (EnterDate IS NULL OR EnterTime IS NULL OR DATE(STR_TO_DATE(CONCAT(EnterDate, ' ', EnterTime), '%Y-%m-%d %H:%i:%s')) < CURDATE())
          ORDER BY STR_TO_DATE(CONCAT(EnterDate, ' ', EnterTime), '%Y-%m-%d %H:%i:%s') DESC
            LIMIT 1
      `;
      }
    }

    const totalTimeUsed = result.reduce(
      (sum: any, item: any) => sum + item.TimeUsed,
      0,
    );
    const totalHours = Math.floor(totalTimeUsed / 60);

    return NextResponse.json(totalHours);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
