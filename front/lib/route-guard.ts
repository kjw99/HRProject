export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  admin: "/admin",
  hr: "/hr",
  applicant: "/applicant",
  interviewer: "/interviewer",
};

export const PROTECTED_ROUTE_RULES: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/hr", roles: ["hr"] },
  { prefix: "/applicant", roles: ["applicant"] },
  { prefix: "/interviewer", roles: ["interviewer"] },
];

/**
 * Public token-entry routes that must bypass auth guard.
 * Keep this list shared between middleware and client-side guard.
 */
export const PUBLIC_AUTH_EXCEPTIONS = [
  "/interviewer/invite",
  "/interviewer-invite",
  "/interview-booking",
  "/interviewer-availability",
] as const;

export function pathnameMatchesProtectedPrefix(
  pathname: string,
  prefix: string,
): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function pathnameMatchesPublicException(pathname: string): boolean {
  return PUBLIC_AUTH_EXCEPTIONS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}