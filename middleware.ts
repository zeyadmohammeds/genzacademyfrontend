import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/courses",
  "/about",
  "/team",
  "/schools",
  "/pricing",
  "/faq",
  "/leaderboard",
  "/api",
  "/_next",
  "/images",
  "/icons",
  "/brochures",
  "/favicon.ico",
  "/og-image.png",
  "/sentry-example-page",
  "/playground",
  "/not-found",
];

const rolePrefixes: Record<string, string[]> = {
  academy_admin: ["/admin"],
  engineer: ["/engineer"],
  cta: ["/cta"],
  parent: ["/parent"],
  student: ["/dashboard", "/my-courses", "/applications", "/cart", "/onboarding", "/profile", "/referrals", "/room", "/notifications"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.toLowerCase();

  if (normalizedPath === "/") return NextResponse.next();

  const isPublic = publicPaths.some(
    (p) => normalizedPath === p || normalizedPath.startsWith(p + "/") || normalizedPath.startsWith(p + "?")
  );

  if (isPublic) return NextResponse.next();

  const authCookie = request.cookies.get("GenZCoders.Auth") || request.cookies.get(".AspNetCore.Identity.Application");
  const isAuthenticated = !!authCookie?.value;

  if (!isAuthenticated) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icons/|brochures/).*)"],
};
