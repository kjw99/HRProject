import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

export const API_URL = "http://localhost:8000/api/knowledge/upload";

// 1. 공통 Axios 인스턴스 설정
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", // FastAPI 서버 주소
  timeout: 10000, // 10초 이상 응답 없으면 에러 처리
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      try {
        // 💡 1. Zustand가 저장한 'auth-storage' 쿠키를 가져옵니다.
        const authData = Cookies.get("auth-storage");

        if (authData) {
          // 💡 2. 쿠키는 JSON 문자열이므로 객체로 파싱합니다.
          // Zustand persist 구조: { "state": { "token": "...", ... }, "version": 0 }
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

// const apiClient = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_URL, // 환경 변수에서 기본 주소 가져오기
//     timeout: 10000, // 10초 이상 응답 없으면 에러 처리
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// 2. 요청(Request) 인터셉터: API를 쏘기 직전에 무조건 실행됨
// apiClient.interceptors.request.use(
//     (config) => {
//         // Zustand 스토어에서 토큰을 꺼내서 헤더에 자동 삽입!
//         const token = useAuthStore.getState().token;
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // 3. 응답(Response) 인터셉터: 에러 공통 처리 (예: 토큰 만료 시 강제 로그아웃)
// apiClient.interceptors.response.use(
//     (response) => response.data, // 보통 response.data만 꺼내서 쓰므로 여기서 미리 가공
//     (error) => {
//         if (error.response?.status === 401) {
//             // 권한 없음 에러 시 상태 초기화 및 리다이렉트 처리
//             useAuthStore.getState().clearAuth();
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

// export default apiClient;
