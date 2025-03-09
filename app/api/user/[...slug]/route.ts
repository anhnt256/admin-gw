import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { User } from "@/prisma/generated/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } },
) {
  const [userId, branch] = params.slug;
  try {
    if (userId && branch) {
      const currentUser: User | null = await db.user.findFirst({
        where: { userId: parseInt(userId, 10), branch },
      });

      return NextResponse.json(currentUser);
    }
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
