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
  userEmail: string;
  role: "admin" | "user" | "hr"; // 역할이 고정되어 있다면 유니온 타입을 사용하세요
}

/**
 * 로그인/인증 성공 시 반환되는 응답 인터페이스
 */
export interface AuthResponse {
  accessToken: string;
  user: UserInfo;
}

export interface ResetPasswordResponse {
  message: string;
  temporaryPassword?: string; // 초기화된 임시 비밀번호
}

/**
 * 비밀번호 변경 요청 인터페이스
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 응답(Response) 데이터 타입 정의
export interface ChangePasswordResponse {
  message: string;
}

// 💡 응답 타입 정의
export interface AuthMeResponse {
  userId: number;
  userEmail: string;
  userName: string;
  role: "admin" | "hr" | "user"; // 시스템 역할
}
