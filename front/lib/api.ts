import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

export const API_URL = `${API_BASE_URL}/api/knowledge/upload`;

// 1. 공통 Axios 인스턴스 설정
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
