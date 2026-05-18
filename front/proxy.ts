import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PROTECTED_ROUTE_RULES,
  ROLE_DEFAULT_PATHS,
  pathnameMatchesProtectedPrefix,
} from "@lib/route-guard";

type JwtPayload = {
  role?: string;
  exp?: number;
};

type PersistedAuthStorage = {
  state?: {
    token?: string | null;
  };
};

function shouldBypassProxyInDev(request: NextRequest): boolean {
  // Disabled on purpose:
  // do not bypass auth/route guard in development.
  return false;
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

function safelyParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(value)) as T;
    } catch {
      return null;
    }
  }
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".");
  if (!payload) return null;

  return safelyParseJson<JwtPayload>(decodeBase64Url(payload));
}

function getTokenFromRequest(request: NextRequest): string | null {
  const directToken = request.cookies.get("accessToken")?.value;
  if (directToken) return directToken;

  const authStorage = request.cookies.get("auth-storage")?.value;
  if (!authStorage) return null;

  const parsed = safelyParseJson<PersistedAuthStorage>(authStorage);
  return parsed?.state?.token ?? null;
}

function isExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

async function fetchPageStatuses() {
  return [
    {
      path: "/payment",
      isActive: false,
      message: "결제 서비스 PG사 연동 작업 중입니다. (14:00~16:00)",
    },
    { path: "/event", isActive: true },
  ];
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypassProxyInDev(request)) {
    return NextResponse.next();
  }

  const pageStatuses = await fetchPageStatuses();
  const blockedPage = pageStatuses.find(
    (page) => pathname.startsWith(page.path) && !page.isActive,
  );

  if (blockedPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    url.searchParams.set(
      "reason",
      blockedPage.message || "현재 페이지를 점검 중입니다.",
    );

    return NextResponse.redirect(url);
  }

  const rule = PROTECTED_ROUTE_RULES.find((entry) =>
    pathnameMatchesProtectedPrefix(pathname, entry.prefix),
  );
  if (!rule) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);
  if (!token) {
    return redirectToLogin(request, pathname);
  }

  const payload = decodeJwtPayload(token);
  const role = payload?.role;
  if (!payload || !role || isExpired(payload)) {
    return redirectToLogin(request, pathname);
  }

  if (!rule.roles.includes(role)) {
    const targetPath = ROLE_DEFAULT_PATHS[role] ?? "/login";
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/hr/:path*",
    "/applicant/:path*",
    "/interviewer/:path*",
  ],
};
