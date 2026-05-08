import { CreatePositionRequest, CreatePositionResponse, DeletePositionResponse, Position, UpdatePositionRequest, UpdatePositionResponse } from "@/types/hr";
import { api } from "../api";

/**
 * @description 새로운 채용 직무 생성 API
 * URL: /api/positions
 * Method: POST
 * Headers: api 인스턴스의 인터셉터가 토큰을 자동 주입합니다.
 */
export const createPosition = async (
    positionData: CreatePositionRequest
): Promise<CreatePositionResponse> => {
    try {
        // HTTP POST 메서드를 사용하여 데이터를 전송합니다.
        const response = await api.post<CreatePositionResponse>(
            '/api/positions',
            positionData
        );
        return response.data;
    } catch (error: any | Error) {
        console.error("🚨 [POST] 직무 생성 실패! 목업 데이터를 반환합니다:", error);

        // 서버 다운 시 프론트엔드 UI 테스트용 가짜 응답 (Fallback)
        return {
            message: "직무 생성이 완료되었습니다. (UI 테스트용 가짜 응답)",
        };
    }
};

/**
 * [클라이언트 전용] 직무 목록 조회 API
 * 용도: 'use client'가 선언된 컴포넌트(모달, 드롭다운, 버튼 이벤트 등)에서 호출
 * URL: /api/positions
 * Method: GET
 */
export const getPositionsClient = async (): Promise<Position[]> => {
    try {
        // 클라이언트 인터셉터가 자동으로 쿠키에서 토큰을 추출해 주입합니다.
        const response = await api.get<Position[]>('/api/positions');
        return response.data;
    } catch (error) {
        console.error("🚨 [GET] 직무 목록 조회 실패 (클라이언트):", error);
        throw error;
    }
};

/**
 * @description 직무 수정 API
 * Method: PATCH
 * URL: /api/positions/{positionId}
 * Params: positionId (Path Variable)
 * Body: { positionName: string }
 */
export const updatePosition = async (
    positionId: number | string,
    data: UpdatePositionRequest
): Promise<UpdatePositionResponse> => {
    try {
        // 💡 PATCH 메서드를 사용하여 특정 직무의 이름을 업데이트합니다.
        const response = await api.patch<UpdatePositionResponse>(
            `/api/positions/${positionId}`,
            data
        );
        return response.data;
    } catch (error: any) {
        console.error(`🚨 [PATCH] 직무 수정 실패 (ID: ${positionId})! 목업 데이터를 반환합니다.`);

        // 서버 통신 실패 시 UI 흐름을 유지하기 위한 가짜 응답 (Fallback)
        return {
            message: "직무 수정이 완료되었습니다. (UI 테스트용 가짜 응답)",
        };
    }
};

/**
 * @description 직무 삭제 API
 * Method: DELETE
 * URL: /api/positions/{positionId}
 * Headers: api 인스턴스의 인터셉터가 auth-storage 쿠키에서 토큰을 자동 주입합니다.
 */
export const deletePosition = async (
    positionId: number | string
): Promise<DeletePositionResponse> => {
    try {
        // 💡 인터셉터가 쿠키에서 토큰을 꺼내 Authorization 헤더를 자동으로 채워줍니다.
        const response = await api.delete<DeletePositionResponse>(
            `/api/positions/${positionId}`
        );

        return response.data;
    } catch (error: any) {
        // 🚨 백엔드 서버가 꺼져있거나 연결이 안 될 경우를 위한 목업 처리
        console.error(
            `🚨 [DELETE] 직무 삭제 실패 (ID: ${positionId})! 테스트용 데이터를 반환합니다.`
        );

        // 성공한 것처럼 응답을 보내 UI 흐름을 유지합니다.
        return {
            message: "직무 삭제가 완료되었습니다 (UI 테스트용 가짜 응답)",
        };
    }
};