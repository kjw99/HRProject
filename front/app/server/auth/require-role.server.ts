import 'server-only';

import { redirect } from 'next/navigation';
import { ROLE_DEFAULT_PATHS } from '@lib/route-guard';
import { getAuthMeServer } from './controlOfAuthority.server';
import { AuthMeResponse } from '@/types/auth';
/**
 * 레이아웃·서버 컴포넌트·페이지에서만 사용하세요.
 * 접근 가능한 역할이 아니면 리다이렉트하고, 통과 시 역할 문자열을 반환합니다.
 */
export async function requireRole(allowedRoles: string[]) {
  try {
    // 💡 1. 백엔드 API를 호출하여 이 사용자가 누군지, 토큰이 유효한지 정확히 확인합니다.
    // (apiServer의 인터셉터가 알아서 auth-storage 쿠키를 까서 토큰을 주입합니다!)
    const authUser: AuthMeResponse = await getAuthMeServer();
    const role = authUser.role;

    // 💡 2. 가져온 진짜 역할(role)이 허용된 역할인지 검사합니다.
    if (!allowedRoles.includes(role)) {
      const targetPath = ROLE_DEFAULT_PATHS[role] || '/login';
      redirect(targetPath);
    }

    // 💡 3. 모든 검증을 통과했다면 역할을 반환합니다.
    return role;

  } catch (error) {
    // 🚨 예외 처리: 토큰이 아예 없거나, 만료되었거나, 백엔드에서 튕겨낸 경우
    // 고민할 필요 없이 무조건 로그인 페이지로 쫓아냅니다.
    redirect('/login');
  }
}