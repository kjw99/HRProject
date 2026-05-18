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

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      try {
        const authData = Cookies.get("auth-storage");

        if (authData) {
          const parsedData = JSON.parse(authData);
          const token = parsedData.state.token;

          if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
          }
        }
      } catch (error) {
        console.error("쿠키 토큰 파싱 중 오류 발생:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);
