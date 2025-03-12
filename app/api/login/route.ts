import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import dayjs from "dayjs";
import crypto from "crypto";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: Request, res: Response): Promise<any> {

  const cookieStore = await cookies();
  const branchFromCookie = cookieStore.get("branch")?.value;

  try {
    const body = await req.text();

    const { userName, password } = JSON.parse(body);

      const currentUser = await db.$queryRaw`
          SELECT * FROM Staff
          WHERE userName = ${userName}
          AND password = SHA2(${password}, 256)
          AND branch = ${branchFromCookie}
          LIMIT 1
        `;

      cookieStore.set("currentUser", JSON.stringify(currentUser), {
        expires: new Date(expirationDate),
      });

      if (currentUser) {
        // @ts-ignore
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
