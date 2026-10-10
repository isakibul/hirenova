import { NextResponse } from "next/server";

const authCookieName = process.env.AUTH_COOKIE_NAME || "hirenova_access";

const protectedPathPrefixes = [
  "/applications",
  "/candidates",
  "/dashboard",
  "/manage-jobs",
  "/manage-newsletter",
  "/manage-users",
  "/messages",
  "/my-jobs",
  "/notifications",
  "/operations",
  "/profile",
  "/saved-jobs",
  "/settings",
  "/system-monitor",
];

function isProtectedPath(pathname) {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (request.cookies.has(authCookieName)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/applications/:path*",
    "/candidates/:path*",
    "/dashboard/:path*",
    "/manage-jobs/:path*",
    "/manage-newsletter/:path*",
    "/manage-users/:path*",
    "/messages/:path*",
    "/my-jobs/:path*",
    "/notifications/:path*",
    "/operations/:path*",
    "/profile/:path*",
    "/saved-jobs/:path*",
    "/settings/:path*",
    "/system-monitor/:path*",
  ],
};
