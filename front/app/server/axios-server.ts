import 'server-only';

import axios, { InternalAxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';

export const apiServer = axios.create({
    baseURL: 'http://localhost:8000', // FastAPI 서버 주소
    headers: {
        'Content-Type': 'application/json',
    },
});

// 💡 서버 전용 요청 인터셉터
apiServer.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const cookieStore = await cookies();
            const authCookie = cookieStore.get('auth-storage')?.value;

            if (authCookie) {
                // Zustand persist 데이터 파싱 (URL 인코딩 대응)
                const parsed = JSON.parse(decodeURIComponent(authCookie));
                const token = parsed.state.token;

                if (token) {
                    config.headers.set('Authorization', `Bearer ${token}`);
                }
            }
        } catch (error) {
            // 서버 로그에만 출력
            console.error("[Server Axios Interceptor] 토큰 주입 실패:", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);