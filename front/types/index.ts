export type {
  SignUpRequest,
  LoginRequest,
  UserInfo,
  AuthResponse,
} from "./auth";

// 페이지 상태(Block/Active)
export interface PageStatus {
  path: string;           // 예: '/payment'
  isActive: boolean;      // true(활성), false(차단)
  message?: string;       // 차단 시 보여줄 메시지 (선택)
}