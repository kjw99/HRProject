import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PROTECTED_ROUTE_RULES,
  ROLE_DEFAULT_PATHS,
  pathnameMatchesProtectedPrefix,
} from "@lib/route-guard";

async function fetchPageStatuses() {
  // 예시 데이터
  return [
    {
      path: "/payment",
      isActive: false,
      message: "결제 시스템 PG사 연동 점검 중입니다. (14:00~16:00)",
    },
    { path: "/event", isActive: true },
  ];
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 현재 접속하려는 경로가 Block 리스트에 있는지 확인합니다.
  // const pageStatuses = await fetchPageStatuses();
  // const blockedPage = pageStatuses.find(
  //   (page) => pathname.startsWith(page.path) && !page.isActive,
  // );

  // 2. 만약 Block된 페이지라면 'maintenance(공사중)' 페이지로 리다이렉트합니다.
  // if (blockedPage) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/maintenance";
  //   // 차단 사유를 URL 파라미터로 넘겨줍니다.
  //   url.searchParams.set(
  //     "reason",
  //     blockedPage.message || "현재 페이지를 점검 중입니다.",
  //   );

  //   return NextResponse.redirect(url);
  // }

  const rule = PROTECTED_ROUTE_RULES.find((r) =>
    pathnameMatchesProtectedPrefix(pathname, r.prefix),
  );
  if (!rule) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("userRole")?.value;

  // if (!token || !role) {
  //   const loginUrl = request.nextUrl.clone();
  //   loginUrl.pathname = "/login";
  //   loginUrl.searchParams.set("from", pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  // if (!rule.roles.includes(role)) {
  //   const targetPath = ROLE_DEFAULT_PATHS[role] ?? "/login";
  //   return NextResponse.redirect(new URL(targetPath, request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/hr/:path*", "/applicant/:path*"],
};
