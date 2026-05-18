import "server-only";

/**
 * 서버 전용(RSC / Route Handler / Server Action)에서 백엔드 HTTP 호출 시 사용합니다.
 * 클라이언트용 `@lib/api` axios와 역할을 분리합니다.
 */
export function getBackendBaseUrl(): string {
  return (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");
}

export async function fetchBackend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getBackendBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, init);
}
