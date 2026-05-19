"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useAuthStore from "@/lib/stores/auth";

export default function NextAuthSessionSync() {
  const { data: session, status } = useSession();
  const syncFromNextAuthSession = useAuthStore(
    (state) => state.syncFromNextAuthSession,
  );
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (status === "authenticated") {
      syncFromNextAuthSession(session);
      return;
    }

    if (status === "unauthenticated") {
      clearAuth();
    }
  }, [status, session, syncFromNextAuthSession, clearAuth]);

  return null;
}
