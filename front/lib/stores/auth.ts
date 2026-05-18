import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import Cookies from "js-cookie";
interface AuthState {
  user: string | null;
  token: string | null;
  setAuth: (user: string, token: string) => void;
  confirmAuth: () => boolean;
  clearAuth: () => void;
}

// 💡 1. Zustand가 쿠키를 읽고 쓸 수 있도록 어댑터(Adapter)를 만듭니다.
const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    // secure: true (HTTPS 권장), sameSite: 'strict' 등 보안 옵션을 추가할 수 있습니다.
    Cookies.set(name, value, { expires: 1, path: '/' }); // 1일 유지
  },
  removeItem: (name: string): void => {
    Cookies.remove(name, { path: '/' });
  },
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),

      confirmAuth: () => {
        const token = get().token;
        return !!token && token.length > 0;
      },

      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage", // 💡 쿠키에 저장될 키 이름이 됩니다. (이 안에 JSON 형태로 user, token, role이 다 들어갑니다)
      // 💡 2. 방금 만든 cookieStorage를 연결해 줍니다!
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);

export default useAuthStore;
