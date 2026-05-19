import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import Cookies from "js-cookie";

interface AuthState {
  user: string | null;
  token: string | null;
  role: string | null;
  setAuth: (user: string, token: string, role?: string | null) => void;
  syncFromNextAuthSession: (session: unknown) => void;
  confirmAuth: () => boolean;
  clearAuth: () => void;
}

type JwtPayload = {
  exp?: number;
  role?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

function persistSideCookies(token: string, user: string, role: string | null) {
  Cookies.set("accessToken", token, { expires: 1, path: "/" });
  Cookies.set("userName", user, { expires: 1, path: "/" });

  if (role) {
    Cookies.set("userRole", role, { expires: 1, path: "/" });
  } else {
    Cookies.remove("userRole", { path: "/" });
  }
}

function clearSideCookies() {
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("userName", { path: "/" });
  Cookies.remove("userRole", { path: "/" });
}

const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, { expires: 1, path: "/" });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name, { path: "/" });
  },
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,

      setAuth: (user, token, role = null) => {
        persistSideCookies(token, user, role);
        set({ user, token, role });
      },

      syncFromNextAuthSession: (session) => {
        const candidate = session as
          | {
              user?: { name?: string | null; role?: string | null };
              accessToken?: string | null;
              token?: string | null;
            }
          | null
          | undefined;

        const token = candidate?.accessToken ?? candidate?.token ?? null;
        const user = candidate?.user?.name ?? null;
        const role = candidate?.user?.role ?? null;

        if (!token || !user) {
          get().clearAuth();
          return;
        }

        get().setAuth(user, token, role);
      },

      confirmAuth: () => {
        const token = get().token;
        if (!token || token.length === 0) return false;

        if (isJwtExpired(token)) {
          get().clearAuth();
          return false;
        }

        return true;
      },

      clearAuth: () => {
        clearSideCookies();
        set({ user: null, token: null, role: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
      }),
    },
  ),
);

export default useAuthStore;
