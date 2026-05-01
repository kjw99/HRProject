import axios, { InternalAxiosRequestConfig } from "axios";

export const API_URL = "http://localhost:8000/api/knowledge/upload";

interface AuthState {
    user: string | null;
    token: string | null;
}

// 스토리지에 저장된 최상위 객체 형태 (Zustand persist 구조)
interface AuthStorageData {
    state: AuthState;
    version: number;
}

// 1. 공통 Axios 인스턴스 설정
export const api = axios.create({
    baseURL: 'http://localhost:8000', // FastAPI 서버 주소
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 서버 사이드 렌더링(SSR) 환경 방어
        if (typeof window !== 'undefined') {
            try {
                // 1) 세션 스토리지에서 문자열 가져오기
                const storedDataString = sessionStorage.getItem('auth-storage');

                if (storedDataString) {
                    // 2) JSON 문자열을 객체로 파싱하고, 우리가 만든 타입으로 단언(Assertion)
                    const parsedData = JSON.parse(storedDataString) as AuthStorageData;

                    // 3) 실제 토큰 값만 추출
                    const token = parsedData.state.token;

                    // 4) 토큰이 존재하면 헤더에 주입
                    if (token) {
                        // Axios 1.x 버전부터는 config.headers가 AxiosHeaders 객체이므로 set() 메서드 사용을 권장합니다.
                        config.headers.set('Authorization', `Bearer ${token}`);
                    }
                }
            } catch (error) {
                // 사용자가 임의로 스토리지를 조작해 JSON 파싱 에러가 날 경우를 대비
                console.error("세션 스토리지에서 토큰을 읽어오는 중 오류 발생:", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);