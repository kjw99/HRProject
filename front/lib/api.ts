import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from 'js-cookie';

export const API_URL = "http://localhost:8000/api/knowledge/upload";

// 1. 공통 Axios 인스턴스 설정
export const api = axios.create({
    baseURL: 'http://localhost:8000', // FastAPI 서버 주소
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            try {
                // 💡 1. Zustand가 저장한 'auth-storage' 쿠키를 가져옵니다.
                const authData = Cookies.get('auth-storage');

                if (authData) {
                    // 💡 2. 쿠키는 JSON 문자열이므로 객체로 파싱합니다.
                    // Zustand persist 구조: { "state": { "token": "...", ... }, "version": 0 }
                    const parsedData = JSON.parse(authData);
                    const token = parsedData.state.token;

                    if (token) {
                        config.headers.set('Authorization', `Bearer ${token}`);
                    }
                }
            } catch (error) {
                console.error("쿠키 토큰 파싱 중 오류 발생:", error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);