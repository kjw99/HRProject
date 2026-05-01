export interface SignUpRequest {
    user_email: string;
    password: string;
    user_name: string;
    role: "admin" | "hr" | "interviewer";
}

export interface LoginRequest {
    user_email: string;
    password: string;
}

/**
 * 사용자 상세 정보 인터페이스
 */
export interface UserInfo {
    userName: string;
    userId: number;
    role: 'admin' | 'user' | "hr"; // 역할이 고정되어 있다면 유니온 타입을 사용하세요
}

/**
 * 로그인/인증 성공 시 반환되는 응답 인터페이스
 */
export interface AuthResponse {
    accessToken: string;
    tokenType: string; // 주로 "bearer"
    user: UserInfo;
}

