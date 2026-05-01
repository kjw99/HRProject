// src/lib/api/adminUsers.server.ts
import { cookies } from "next/headers";
import axios from "axios";
import { User, PaginatedResponse } from "@/types/admin";

export const fetchUsersList = async (
  page: number = 0,
  size: number = 20,
  keyword: string = "",
): Promise<PaginatedResponse<User>> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await axios.get<PaginatedResponse<User>>(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/users`,
      {
        params: { page, size, keyword },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("🚨 [GET] 서버 연결 실패! 목업 데이터를 반환합니다:", error);

    const mockContent: User[] = Array.from({ length: size }).map((_, i) => ({
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
      content: [...mockContent], // 실제 작성하신 목업 로직을 여기에 그대로 두세요
      page,
      size,
      totalElements: 0,
      totalPages: 0,
    };
  }
};
