/** 역할별 로그인 후 기본 이동 경로 (미들웨어·서버 가드 공통) */
export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  admin: "/admin",
  hr: "/hr",
  applicant: "/applicant",
  interviewer: "/interviewer",
};

/** URL 접두사별 허용 역할 */
export const PROTECTED_ROUTE_RULES: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/hr", roles: ["hr"] },
  { prefix: "/applicant", roles: ["applicant"] },
  { prefix: "/interviewer", roles: ["interviewer"] },
];

export function pathnameMatchesProtectedPrefix(
  pathname: string,
  prefix: string,
): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
