import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const isDev = process.env.NODE_ENV === "development";
const rawApiBaseUrl = (
  isDev
    ? process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:8000"
    : process.env.NEXT_PUBLIC_API_URL
)?.trim();

if (!rawApiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is required in production.");
}

if (!/^https?:\/\//i.test(rawApiBaseUrl)) {
  throw new Error("NEXT_PUBLIC_API_URL must start with http:// or https://.");
}

const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const API_URL = `${API_BASE_URL}/api/knowledge/upload`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let cachedAuthStorageRaw: string | undefined;
let cachedBearerToken: string | null = null;

function resolveBearerTokenFromCookie(): string | null {
  const authData = Cookies.get("auth-storage");
  if (!authData) {
    cachedAuthStorageRaw = undefined;
    cachedBearerToken = null;
    return null;
  }

  if (authData === cachedAuthStorageRaw) {
    return cachedBearerToken;
  }

  cachedAuthStorageRaw = authData;

  let parsedData: unknown = null;
  try {
    parsedData = JSON.parse(authData);
  } catch {
    parsedData = JSON.parse(decodeURIComponent(authData));
  }

  cachedBearerToken =
    (parsedData as { state?: { token?: string } })?.state?.token ?? null;
  return cachedBearerToken;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    if (typeof window !== "undefined") {
      try {
        const token = resolveBearerTokenFromCookie();
        if (token) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (error) {
        console.error("쿠키 토큰 파싱 중 오류 발생:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);
