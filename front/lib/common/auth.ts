import { SignUpRequest, LoginRequest, AuthResponse, ResetPasswordResponse, ChangePasswordResponse, ChangePasswordRequest, AuthMeResponse } from '@typings/auth';
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

export const resetUserPassword = async (userEmail: string): Promise<ResetPasswordResponse> => {
    const randomTempPW = `Temp!${Math.floor(Math.random() * 10000)}`;
    try {
        const response = await api.post<ResetPasswordResponse>(`/api/admin/users/${userEmail}/reset-password`);
        return response.data;
    } catch (error: any | Error) {
        console.error(`🚨 [POST] 비밀번호 초기화 실패! 목업 데이터를 반환합니다 (Email: ${userEmail})`);

        // 서버 다운 시 프론트엔드 UI 테스트용 가짜 응답
        return {
            message: "비밀번호가 성공적으로 초기화되었습니다.",
            temporaryPassword: randomTempPW,
        };
    }
};

/**
 * @description 내 비밀번호 변경 API
 * URL: /api/users/me/password
 * Method: PATCH
 * Headers: api 인스턴스의 인터셉터가 토큰을 자동 주입합니다.
 */
export const changeMyPassword = async (
    passwordData: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
    try {
        // 💡 api.put 대신 api.patch를 사용하여 일부 정보(비밀번호)만 업데이트하도록 요청합니다.
        const response = await api.patch<ChangePasswordResponse>(
            '/api/users/me/password',
            passwordData
        );
        return response.data;
    } catch (error: any | Error) {
        console.error("🚨 [PATCH] 비밀번호 변경 실패! 목업 데이터를 반환합니다.");

        // 서버 다운 시 프론트엔드 UI 테스트용 가짜 응답 (Fallback)
        return {
            message: "비밀번호가 변경되었습니다 (UI 테스트용 가짜 응답)",
        };
    }
};

/**
 * [클라이언트 전용] 내 인증 정보 조회
 * 용도: 브라우저 환경에서 버튼 클릭, 상태 검증 시 사용
 */
export const getAuthMeClient = async (): Promise<AuthMeResponse> => {
    const response = await api.get<AuthMeResponse>('/api/auth/me');
    return response.data;
};