import useAuthStore from '@lib/stores/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ToastUI } from '@/components/ui/ToastUI';
import Cookies from 'js-cookie';
import { signOut } from 'next-auth/react';

export default function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // 실행할 로그아웃 함수
  const logout = () => {
    toast.custom((t) => (
      <ToastUI t={t} message="로그인 화면으로 이동합니다" duration={500} />
    ), {
      duration: 500,
    });

    setTimeout(async () => {
      clearAuth();
      await signOut({ redirect: false });
      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('userRole', { path: '/' });
      Cookies.remove('userName', { path: '/' });
      router.push('/');
    }, 1000);
  };

  // 컴포넌트에서 쓸 수 있도록 함수를 반환
  return logout;
};
