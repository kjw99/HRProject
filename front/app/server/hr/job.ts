import { Position } from "@/types/hr";
import { apiServer } from "../axios-server";

export const getPositionsServer = async (): Promise<Position[]> => {
    try {
        // 서버 인터셉터가 자동으로 next/headers를 통해 토큰을 주입합니다.
        const response = await apiServer.get<Position[]>('/api/positions');
        return response.data;
    } catch (error: any) {
        console.error("🚨 [GET] 직무 목록 조회 실패 (서버). 임시 데이터를 반환합니다:", error.message);

        // 백엔드 통신 실패 시 UI 붕괴를 막기 위한 Fallback(목업) 데이터 반환
        return [
            {
                positionId: 1,
                positionName: "프론트엔드 개발자 (임시)",
                createdAt: "2026-04-21T10:00:00+09:00"
            },
            {
                positionId: 2,
                positionName: "백엔드 개발자 (임시)",
                createdAt: "2026-04-21T10:00:00+09:00"
            },
            {
                positionId: 3,
                positionName: "UX/UI 디자이너 (임시)",
                createdAt: "2026-04-21T10:00:00+09:00"
            }
        ];
    }
};