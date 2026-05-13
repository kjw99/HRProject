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

export interface UserInfo {
  userName: string;
  userId: number;
  userEmail: string;
  role: "admin" | "hr" | "interviewer";
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserInfo;
}

export interface ResetPasswordResponse {
  message: string;
  temporaryPassword?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface AuthMeResponse {
  userId: number;
  userEmail: string;
  userName: string;
  role: "admin" | "hr" | "interviewer";
  createdAt: string;
}
