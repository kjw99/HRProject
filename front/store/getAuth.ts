import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  user: string;
  token: boolean;
  setAuth: (user: string, token: boolean) => void;
  confirmAuth: () => boolean;  // 반환 타입 명시
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: "",
      token: false,

      setAuth: (user: string, token: boolean) => set({ user, token }),

      // ✅ 수정: get().token 직접 반환
      confirmAuth: () => get().token,

      clearAuth: () => set({ user: "", token: false })
    }),
    {
      name: "authStorage",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

export default useAuthStore;