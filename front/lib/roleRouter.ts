import { ROLE_DEFAULT_PATHS } from '@lib/route-guard';

/** 클라이언트에서 로그인 직후 등 역할에 맞는 홈 경로로 보낼 때 사용 */
export function roleRouter(role: string | null): string {
  if (!role) return '/login';
  return ROLE_DEFAULT_PATHS[role] ?? '/login';
}
