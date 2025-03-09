import apiClient from "@/lib/apiClient";
import { NextResponse } from "next/server";
import { getCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY } from "@/constants/token.constant";

export async function POST(req: Request, res: Response): Promise<any> {
  try {
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.delete("token");

    return response;
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
