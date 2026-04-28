import useAuthStore from '@/store/getAuth';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // 환경 변수에서 기본 주소 가져오기
    timeout: 10000, // 10초 이상 응답 없으면 에러 처리
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. 요청(Request) 인터셉터: API를 쏘기 직전에 무조건 실행됨
apiClient.interceptors.request.use(
    (config) => {
        // Zustand 스토어에서 토큰을 꺼내서 헤더에 자동 삽입!
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. 응답(Response) 인터셉터: 에러 공통 처리 (예: 토큰 만료 시 강제 로그아웃)
apiClient.interceptors.response.use(
    (response) => response.data, // 보통 response.data만 꺼내서 쓰므로 여기서 미리 가공
    (error) => {
        if (error.response?.status === 401) {
            // 권한 없음 에러 시 상태 초기화 및 리다이렉트 처리
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;