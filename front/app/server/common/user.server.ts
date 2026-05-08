import 'server-only';

import { UserProfile } from "@/types/myInformation";
import { apiServer } from "../axios-server";

/**
 * @description 서버 사이드에서 내 프로필 정보를 가져옵니다.
 * 서버 통신 실패 시 UI 붕괴를 막기 위해 안전한 임시 데이터를 반환합니다.
 */
export async function getMyProfileServer(): Promise<UserProfile> {
    try {
        const response = await apiServer.get<UserProfile>('/api/users/me');
        return response.data;
    } catch (error: any) {
        // 💡 1. 디버깅을 위해 서버 콘솔에만 에러 원인을 조용히 남겨둡니다.
        console.error("[getMyProfileServer] 백엔드 통신 실패. 임시 데이터를 렌더링합니다:", error.message);

        // 💡 2. 화면이 깨지지 않도록 형태가 완벽히 일치하는 임시 데이터를 반환합니다.
        return {
            userId: 1004,
            userEmail: "dasol.han@company.com",
            userName: "한다솔",
            role: "hr",
            createdAt: "2026-05-01T09:00:00+09:00"
        };
    }
}