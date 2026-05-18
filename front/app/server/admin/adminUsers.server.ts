import 'server-only';

// src/lib/api/adminUsers.server.ts
import { AdminUser, AdminUserListResponse } from "@/types/admin";
import { apiServer } from "../axios-server";

export const fetchUsersList = async (
  page: number = 0,
  size: number = 20,
  keyword: string = "",
): Promise<AdminUserListResponse> => {
  try {
    // 💡 마법처럼 짧아진 코드!
    // 쿠키 추출, 토큰 파싱, 헤더 주입, baseURL 설정은 모두 apiServer 인터셉터가 알아서 처리합니다.
    const response = await apiServer.get<AdminUserListResponse>('/api/admin/users', {
      params: { page, size, keyword },
    });

    return response.data;
  } catch (error) {
    console.error("🚨 [GET] 서버 연결 실패! 목업 데이터를 반환합니다:", error);

    // 실제 작성하신 목업 로직 그대로 유지
    const mockContent: AdminUser[] = Array.from({ length: size }).map((_, i) => ({
      userId: page * size + i + 1,
      userEmail: keyword
        ? `${keyword}${i}@company.com`
        : `test${page * size + i + 1}@company.com`,
      userName: keyword
        ? `${keyword} ${i + 1}`
        : `테스트 유저 ${page * size + i + 1}`,
      role: i % 4 === 0 ? "admin" : "hr",
      createdAt: new Date(
        Date.now() - Math.random() * 10000000000,
      ).toISOString(),
      status: i % 5 === 0 ? "BLOCK" : "ACTIVE",
    }));

    return {
      content: [...mockContent],
    };
  }
};