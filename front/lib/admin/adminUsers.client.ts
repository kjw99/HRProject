// src/lib/api/adminUsers.client.ts
import {
  User,
  CreateUserRequest,
  EmailAvailabilityResponse,
  DeleteUserResponse,
} from "@/types/admin";
import { api } from "@/lib/api"; // 만들어두신 클라이언트용 axios (인터셉터 포함)

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await api.post<User>("/api/admin/users", data);
  return response.data;
};

export const checkEmailAvailability = async (
  email: string,
): Promise<EmailAvailabilityResponse> => {
  const response = await api.get<EmailAvailabilityResponse>(
    "/api/users/email-availability",
    {
      params: { email },
    },
  );
  return response.data;
};

export const getUserDetail = async (userId: number): Promise<User> => {
  try {
    // 1. 서버 통신 성공 시
    const response = await api.get<User>(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    // 2. 서버 통신 실패 시 (catch)
    console.error(
      `🚨 [GET] 사용자 단건 조회 실패! 목업 데이터를 반환합니다 (ID: ${userId})`,
      error,
    );

    // 요청한 userId를 기반으로 1개의 가짜 사용자 데이터를 생성하여 반환합니다.
    return {
      userId: userId,
      userEmail: `test${userId}@company.com`,
      userName: `테스트 유저 ${userId}`,
      // 전달받은 userId 숫자에 따라 % 연산을 하여 다양한 데이터가 나오게 함
      role: userId % 4 === 0 ? "admin" : "hr",
      createdAt: new Date(
        Date.now() - Math.random() * 10000000000,
      ).toISOString(),
      status: userId % 5 === 0 ? "BLOCK" : "ACTIVE",
    };
  }
};

export const deleteUser = async (
  userId: number,
): Promise<DeleteUserResponse> => {
  const response = await api.delete<DeleteUserResponse>(
    `/api/admin/users/${userId}`,
  );
  return response.data;
};
