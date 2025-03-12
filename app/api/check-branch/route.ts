import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCookie } from "cookies-next";

export async function GET(req: Request, res: Response): Promise<any> {
  const macAddress = getCookie("macAddress", { req, res });
  // const macAddress = "A4-0C-66-0B-E6-DE";

  try {
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

      console.log("result", result);

      const response = NextResponse.json({
        status: "success",
        machineName: result?.name,
      });

      // @ts-ignore
      response.cookies.set({
        name: "branch",
        value: result?.branch,
        maxAge: 86400,
      });

      return response;
    }
  } catch (error) {
    return NextResponse.json({
      status: error,
    });
  }
}
