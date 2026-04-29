import useAuthStore from '@/store/getAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ToastUI } from '@/components/rest/ToastUI'; // 실제 경로에 맞게 수정

export default function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // 실행할 로그아웃 함수
  const logout = () => {
    toast.custom((t) => (
      <ToastUI t={t} message="로그인 화면으로 이동합니다" duration={1000} />
    ), {
      duration: 1000,
    });

    setTimeout(() => {
      clearAuth();
      // TODO: 실제 로그아웃 로직 추가 (예: signOut(), 로컬 스토리지 삭제 등)
      localStorage.removeItem('candidate_info');
      localStorage.removeItem('last_job_posting');
      router.push('/login');
    }, 1000);
  };

  // 컴포넌트에서 쓸 수 있도록 함수를 반환
  return logout;
};