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