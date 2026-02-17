import { NextRequest, NextResponse } from "next/server";
import { getAdminRouteSlug } from "./lib/admin-path";

const INTERNAL_ADMIN_BASE = "/admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSlug = getAdminRouteSlug();
  const publicAdminBase = `/${adminSlug}`;

  if (
    adminSlug !== "admin" &&
    (pathname === INTERNAL_ADMIN_BASE || pathname.startsWith(`${INTERNAL_ADMIN_BASE}/`))
  ) {
    const redirected = request.nextUrl.clone();
    redirected.pathname =
      pathname === INTERNAL_ADMIN_BASE
        ? publicAdminBase
        : pathname.replace(INTERNAL_ADMIN_BASE, publicAdminBase);
    return NextResponse.redirect(redirected);
  }

  if (pathname === publicAdminBase || pathname.startsWith(`${publicAdminBase}/`)) {
    const rewritten = request.nextUrl.clone();
    rewritten.pathname =
      pathname === publicAdminBase
        ? INTERNAL_ADMIN_BASE
        : pathname.replace(publicAdminBase, INTERNAL_ADMIN_BASE);
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
