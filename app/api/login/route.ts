import { NextResponse } from "next/server";
import { getCookie } from "cookies-next";
import { cookies, headers } from "next/headers";
import { db, getFnetDB, getFnetPrisma } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import isEmpty from "lodash/isEmpty";
import { BRANCH } from "@/constants/enum.constant";
import dayjs from "dayjs";
import crypto from "crypto";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: Request, res: Response): Promise<any> {
  try {
    const macAddress = getCookie("macAddress", { req, res });
    // const macAddress = "A4-0C-66-0B-E3-AD";
    const body = await req.text();

    const { userName, password } = JSON.parse(body);

    if (macAddress) {
      const result = await db.computer.findFirst({
        where: {
          localIp: macAddress.replaceAll(":", "-").toUpperCase(),
        },
        select: {
          name: true,
          branch: true,
        },
      });

      const cookieStore = cookies();
      // @ts-ignore
      cookieStore.set("branch", result?.branch, {
        expires: new Date(expirationDate),
      });

      const currentUser = await db.$queryRaw`
          SELECT * FROM Staff
          WHERE userName = ${userName}
          AND password = SHA2(${password}, 256)
          AND branch = ${result?.branch}
          LIMIT 1
        `;

      cookieStore.set("currentUser", JSON.stringify(currentUser), {
        expires: new Date(expirationDate),
      });

      if (currentUser) {
        const token = await signJWT({ userId: currentUser?.id });
        const response = NextResponse.json(currentUser);

        response.cookies.set({
          name: "token",
          value: token,
          maxAge: 86400,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        return response;
      }
    }
    return NextResponse.json("Login Fail", { status: 401 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Error";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
