import type { AuthResponse } from '@typings/auth';
import Cookies from 'js-cookie';

const cookieOpts = { expires: 1, path: '/' as const };

/** 브라우저 쿠키 저장 (클라이언트 전용, 로그인 성공 후 등) */
function saveCookies(data: AuthResponse) {
  Cookies.set('userRole', data.user.role, cookieOpts);
  Cookies.set('accessToken', data.accessToken, cookieOpts);
  Cookies.set('userName', data.user.userName, cookieOpts);
}
