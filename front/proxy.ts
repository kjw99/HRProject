import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PROTECTED_ROUTE_RULES,
  ROLE_DEFAULT_PATHS,
  pathnameMatchesProtectedPrefix,
} from "@lib/route-guard";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rule = PROTECTED_ROUTE_RULES.find((r) =>
    pathnameMatchesProtectedPrefix(pathname, r.prefix),
  );
  if (!rule) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("userRole")?.value;

  if (!token || !role) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!rule.roles.includes(role)) {
    const targetPath = ROLE_DEFAULT_PATHS[role] ?? "/login";
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/hr/:path*", "/applicant/:path*"],
};
