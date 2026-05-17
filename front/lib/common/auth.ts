import {
  AuthMeResponse,
  AuthResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  ResetPasswordResponse,
  SignUpRequest,
} from "@typings/auth";
import { api } from "@lib/api";

export const signUpApi = async (data: SignUpRequest) => {
  const response = await api.post("/api/auth/signup", data);
  return response.data;
};

export const loginApi = async (data: LoginRequest) => {
  const response = await api.post<AuthResponse>("/api/auth/login", data);
  return response.data;
};

export const resetUserPassword = async (
  userEmail: string,
): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>(
    `/api/admin/users/${encodeURIComponent(userEmail)}/reset-password`,
  );
  return response.data;
};

export const changeMyPassword = async (
  passwordData: ChangePasswordRequest,
): Promise<ChangePasswordResponse> => {
  const response = await api.patch<ChangePasswordResponse>(
    "/api/users/me/password",
    passwordData,
  );
  return response.data;
};

export const getAuthMeClient = async (): Promise<AuthMeResponse> => {
  const response = await api.get<AuthMeResponse>("/api/auth/me");
  return response.data;
};
