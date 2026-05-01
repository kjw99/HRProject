import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  user: string | null;
  token: string | null;
  role: string | null;
  setAuth: (user: string, token: string, role: string) => void;
  confirmAuth: () => boolean;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,

      setAuth: (user, token, role) => set({ user, token, role }),

      confirmAuth: () => {
        const token = get().token;
        return !!token && token.length > 0;
      },

      clearAuth: () => set({ user: null, token: null, role: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);

export default useAuthStore;
