import axios from 'axios';
import { SignUpRequest, LoginRequest, LoginResponse } from '@/types/auth';

// 1. 공통 Axios 인스턴스 설정
const api = axios.create({
    baseURL: 'http://localhost:8000', // FastAPI 서버 주소
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 회원가입 API
 */
export const signUpApi = async (data: SignUpRequest) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
};

/**
 * 로그인 API
 */
export const loginApi = async (data: LoginRequest) => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data as LoginResponse;
};