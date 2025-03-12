import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyJWT } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const publicPaths = ["/", "/api/login", "/api/check-branch"];

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return response;
  }

  // Verify token cho tất cả API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 },
      );
    }

    const payload = verifyJWT(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    // Thêm user info vào headers để có thể dùng trong API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("user", JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
