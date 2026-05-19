"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  pathnameMatchesPublicException,
  pathnameMatchesProtectedPrefix,
} from "@/lib/route-guard";

const PROTECTED_PREFIXES = ["/admin", "/hr", "/applicant", "/interviewer"];

function isProtectedPath(pathname: string): boolean {
  if (pathnameMatchesPublicException(pathname)) {
    return false;
  }

  return PROTECTED_PREFIXES.some((prefix) =>
    pathnameMatchesProtectedPrefix(pathname, prefix),
  );
}

function hasAuthToken(): boolean {
  const directToken = Cookies.get("accessToken");
  if (directToken) return true;

  const authStorage = Cookies.get("auth-storage");
  if (!authStorage) return false;

  try {
    const parsed = JSON.parse(authStorage);
    return Boolean(parsed?.state?.token);
  } catch {
    try {
      const parsed = JSON.parse(decodeURIComponent(authStorage));
      return Boolean(parsed?.state?.token);
    } catch {
      return false;
    }
  }
}

export default function BackNavAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isProtectedPath(pathname)) return;

    const validate = () => {
      if (!hasAuthToken()) {
        router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      }
    };

    validate();
    window.addEventListener("pageshow", validate);

    return () => {
      window.removeEventListener("pageshow", validate);
    };
  }, [pathname, router]);

  return null;
}

