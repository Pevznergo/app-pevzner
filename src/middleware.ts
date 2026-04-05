import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // next-auth v5 cookie names (encrypted JWT)
  const hasSession =
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("next-auth.session-token");

  if (!hasSession) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quiz/:path*"],
};
