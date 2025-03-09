import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { MISSION_TYPE } from "@/constants/enum.constant";
import { Mission } from "@/prisma/generated/prisma-client";
import { getRandomItem } from "@/lib/utils";

const MAX_HOURS_MISSION = 3; // sáng 1, chiều 1, tối 1
const MAX_FOOD_MISSION = 2;
export async function GET(req: Request) {
  try {
    const results: Mission[] = [];
    const missions = await db.mission.findMany();

    const hoursMission = missions.filter((x) => x.type === MISSION_TYPE.HOURS);

    const morningMission = hoursMission.filter((x) => x.startHours === 7);
    const afternoonMission = hoursMission.filter((x) => x.startHours === 13);
    const nightMission = hoursMission.filter((x) => x.startHours === 19);

    const orderMission = missions.filter((x) => x.type === MISSION_TYPE.ORDER);

    const comboMission = missions.filter((x) => x.type === MISSION_TYPE.COMBO);

    if (morningMission.length > 0) {
      results.push(getRandomItem(morningMission));
    }

    if (afternoonMission.length > 0) {
      results.push(getRandomItem(afternoonMission));
    }

    if (nightMission.length > 0) {
      results.push(getRandomItem(nightMission));
    }

    if (orderMission.length > 0) {
      results.push(getRandomItem(orderMission));
    }

    if (comboMission.length > 0) {
      results.push(getRandomItem(comboMission));
    }

    return NextResponse.json(results);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
