export interface HrMenuItem {
    name: string;
    path: string;
    icon: string;
}

export interface HrUser {
    name: string;
    role: string;
    profileImage?: string;
}

// SSR용 대시보드 통계 타입
export interface HrStats {
    id: string;
    label: string;
    value: number;
    increment: number;
    icon: string;
}

// JOB
// 💡 1. 요청(Request) 데이터 타입 정의
export interface CreatePositionRequest {
    positionName: string;
}

// 💡 2. 응답(Response) 데이터 타입 정의
export interface CreatePositionResponse {
    message: string;
}

// 💡 1. 응답 데이터 타입(인터페이스) 정의
export interface Position {
    positionId: number;
    positionName: string;
    createdAt: string;
}

/**
 * 💡 직무 수정 요청 데이터 인터페이스
 */
export interface UpdatePositionRequest {
    positionName: string;
}

/**
 * 💡 직무 수정 응답 데이터 인터페이스
 */
export interface UpdatePositionResponse {
    message: string;
}

// 응답(Response) 데이터 타입 정의
export interface DeletePositionResponse {
    message: string;
}