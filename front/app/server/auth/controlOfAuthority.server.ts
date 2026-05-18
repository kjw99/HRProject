import 'server-only';

import { AuthMeResponse } from "@/types/auth";
import { apiServer } from "../axios-server";

/**
 * [서버 전용] 내 인증 정보 조회
 * 용도: page.tsx, layout.tsx 등 서버 컴포넌트에서 렌더링 전 권한 검증 시 사용
 */
export const getAuthMeServer = async (): Promise<AuthMeResponse> => {
    try {
        const response = await apiServer.get<AuthMeResponse>('/api/auth/me');
        return response.data;
    } catch (error) {
        // 인증 실패 시 에러를 던져서 서버에서 리다이렉트 처리할 수 있게 함
        throw new Error("인증되지 않은 사용자입니다.");
    }
};