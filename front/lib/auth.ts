import { SignUpRequest, LoginRequest, AuthResponse } from '@typings/auth';
import { api } from '@lib/api';

/**
 * 회원가입 API
 */
export const signUpApi = async (data: SignUpRequest) => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
};

/**
 * 로그인 API
 */
export const loginApi = async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data as AuthResponse;
};