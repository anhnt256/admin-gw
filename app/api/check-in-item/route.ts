import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const checkInItems = await db.checkInItem.findMany();

    return NextResponse.json(checkInItems);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
