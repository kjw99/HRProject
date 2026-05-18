import "server-only";
import { Position } from "@/types/position";
import { apiServer } from "../axios-server";

export const fetchPositionsServer = async (): Promise<Position[]> => {
  try {
    // 실제 API 호출
    const response = await apiServer.get<Position[]>("/api/positions");
    return response.data;
  } catch (error) {
    console.warn("🚨 [Server API] 직무 리스트 로드 실패. 목업을 반환합니다.");

    // 명세서에 맞춘 목업 데이터
    return [
      {
        positionId: 1,
        positionName: "프론트엔드 개발자",
        createdAt: "2026-04-21T10:00:00+09:00",
      },
      {
        positionId: 2,
        positionName: "백엔드 개발자",
        createdAt: "2026-04-20T11:30:00+09:00",
      },
      {
        positionId: 3,
        positionName: "퍼포먼스 마케터",
        createdAt: "2026-04-19T09:15:00+09:00",
      },
      {
        positionId: 4,
        positionName: "B2B 세일즈 매니저",
        createdAt: "2026-04-18T14:20:00+09:00",
      },
    ];
  }
};
