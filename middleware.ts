import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("employee_token")?.value;

  const isLoginPage = request.nextUrl.pathname === "/employee/login";

  if (isLoginPage) {
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL("/employee", request.url));
    }

    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/employee")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/employee/login", request.url)
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      const response = NextResponse.redirect(
        new URL("/employee/login", request.url)
      );

      response.cookies.delete("employee_token");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/employee/:path*"],
};