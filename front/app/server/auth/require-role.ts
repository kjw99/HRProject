import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROLE_DEFAULT_PATHS } from '@lib/route-guard';

/**
 * 레이아웃·서버 컴포넌트·페이지에서만 사용하세요.
 * 접근 가능한 역할이 아니면 리다이렉트하고, 통과 시 역할 문자열을 반환합니다.
 */
export async function requireRole(allowedRoles: string[]) {
  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value;
  const token = cookieStore.get('accessToken')?.value;

  if (!token || !role) {
    redirect('/login');
  }

  if (!allowedRoles.includes(role)) {
    const targetPath = ROLE_DEFAULT_PATHS[role] || '/login';
    redirect(targetPath);
  }

  return role;
}
