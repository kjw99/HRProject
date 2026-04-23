import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  user: string | null;     // 유저 정보가 없을 땐 null
  token: string | null;    // boolean 대신 실제 토큰(string) 저장
  setAuth: (user: string, token: string) => void;
  confirmAuth: () => boolean;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      // 로그인 시 유저 정보와 토큰 저장
      setAuth: (user, token) => set({ user, token }),

      // 토큰이 실제로 존재하고 비어있지 않은지 확인
      confirmAuth: () => {
        const token = get().token;
        return !!token && token.length > 0;
      },

      // 로그아웃 시 초기화
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      // (선택 사항) 스토리지에 저장하고 싶은 데이터만 골라서 저장
      // 보안상 비밀번호나 민감 정보가 state에 있다면 제외 가능
      partialize: (state) => ({
        user: state.user,
        token: state.token
      }),
    }
  )
);

export default useAuthStore;