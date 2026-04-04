export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/quiz/:path*", "/admin/:path*"],
};
