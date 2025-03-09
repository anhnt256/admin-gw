import { NextResponse } from "next/server";

import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { cookies } from "next/headers";
import dayjs from "@/lib/dayjs";
import { Prisma } from "@/prisma/generated/prisma-client";

export async function GET() {
  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  const startOfDayVN = dayjs()
    .tz("Asia/Ho_Chi_Minh")
    .startOf("day")
    .add(7, "hours")
    .toISOString();

  const today = dayjs().format("ddd");

  try {
    const fnetDB = await getFnetDB();
    const fnetPrisma = await getFnetPrisma();

    const results = [];

    const computers = await db.computer.findMany({
      where: {
        branch: branchFromCookie,
        name: {
          not: 'ADMIN'
        },
      },
    });

    const query = fnetPrisma.sql`
      SELECT s.MachineName, s.EnterDate, s.EnterTime, s.Status, s.UserId
      FROM systemlogtb s
             INNER JOIN (
        SELECT MachineName, MAX(EnterDate) AS MaxEnterDate
        FROM systemlogtb
        WHERE MachineName NOT LIKE 'MAY-%'
        GROUP BY MachineName
      ) latest_date
                        ON s.MachineName = latest_date.MachineName
                          AND s.EnterDate = latest_date.MaxEnterDate
             INNER JOIN (
        SELECT MachineName, EnterDate, MAX(EnterTime) AS MaxEnterTime
        FROM systemlogtb
        WHERE MachineName NOT LIKE 'MAY-%'
        GROUP BY MachineName, EnterDate
      ) latest_time
                        ON s.MachineName = latest_time.MachineName
                          AND s.EnterDate = latest_time.EnterDate
                          AND s.EnterTime = latest_time.MaxEnterTime
      WHERE s.MachineName NOT LIKE 'MAY-%'
      ORDER BY MachineName ASC, s.EnterDate ASC, s.EnterTime ASC;
    `;

    const computerStatus = await fnetDB.$queryRaw<any[]>(query);

    for (const computer of computers) {
      const { name } = computer || {};

      const computerStatusData = computerStatus.find(
        (status: { MachineName: string }) => status.MachineName === name,
      );

      const { UserId, Status } = computerStatusData || {};

      let user;
      let checkIn = 0;
      let totalRound = 0;
      if (UserId) {
        const query = fnetPrisma.sql`
      SELECT *
      FROM fnet.systemlogtb AS t1
      WHERE t1.UserId = ${UserId.toString()}
        AND t1.status = 3
        AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) = CURDATE()

      UNION ALL

      SELECT *
      FROM (
             SELECT *
             FROM fnet.systemlogtb AS t1
             WHERE t1.UserId = ${UserId.toString()}
               AND t1.status = 3
               AND DATE(STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s')) < CURDATE()
      ORDER BY STR_TO_DATE(CONCAT(t1.EnterDate, ' ', t1.EnterTime), '%Y-%m-%d %H:%i:%s') DESC
        LIMIT 1
        ) AS t2`;
        const result = await fnetDB.$queryRaw<any[]>(query);

        const totalTimeUsed = result.reduce(
          (sum, item) => sum + item.TimeUsed,
          0,
        );
        const totalPlayTime = Math.floor(totalTimeUsed / 60);

        const checkInItems = await db.checkInItem.findMany();

        const todayCheckIn = checkInItems.find(
          (item) => item.dayName === today,
        );
        const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

        const canClaim = totalPlayTime * starsPerHour;

        const userClaim = await db.userStarHistory.findMany({
          where: {
            userId: UserId,
            branch: branchFromCookie,
            type: "CHECK_IN",
            createdAt: {
              gte: startOfDayVN, // Check if createdAt is greater than or equal to today at 00:00:00
            },
          },
        });

        const totalClaimed = userClaim.reduce((acc, item) => {
          const difference = (item.newStars ?? 0) - (item.oldStars ?? 0);
          return acc + difference;
        }, 0);

        checkIn = canClaim - totalClaimed;

        user = await db.user.findFirst({
          where: {
            userId: UserId,
            branch: branchFromCookie,
          },
        });

        // Calc Round
        const fnetQuery = fnetPrisma.sql`
      SELECT COALESCE(CAST(SUM(AutoAmount) AS DECIMAL(18,2)), 0) AS total
      FROM fnet.paymenttb
      WHERE PaymentType = 4
        AND UserId = ${parseInt(UserId, 10)}
        AND Note = N'Thời gian phí'
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) >= DATE(NOW()) - INTERVAL 30 DAY
        AND (ServeDate + INTERVAL ServeTime HOUR_SECOND) <= NOW()
    `;

        const resultData =
          await fnetDB.$queryRaw<[{ total: number }]>(fnetQuery);

        const userTopUp = parseFloat(resultData[0].total.toString());

        const round = Math.floor(
          userTopUp
            ? userTopUp / Number(process.env.NEXT_PUBLIC_SPEND_PER_ROUND)
            : 0,
        );

        // Số lượt đã sử dụng
        const queryRound = Prisma.sql`
                      SELECT COUNT(*) as count
                      FROM GameResult gr
                      WHERE gr.userId = ${parseInt(UserId, 10)}
                      AND CreatedAt >= DATE(NOW()) - INTERVAL 30 DAY
                      AND CreatedAt <= NOW();
                    `;

        const userRound = await db.$queryRaw<[{ count: bigint }]>(queryRound);

        totalRound = Number(userRound[0].count);
      }

      results.push({
        name,
        status: Status,
        userId: UserId,
        userName: user?.userName,
        canClaim: checkIn,
        round: totalRound,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.log('error', error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}
