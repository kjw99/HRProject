export interface ParsingItem {
    filename: string;
    record: {
        candidateId: number;
        resumeId: number;
        positionMatch: {
            status: string;
            matchedPositionName: string | null;
            reason: string;
        };
        candidate: {
            name: string;
            dateOfBirth: string;
            phone: string;
            email: string | null;
            meetsPreferredCriteria: string[];
        };
        resume: {
            summary: string;
        };
        aiProfile: {
            target_position: string;
            candidate_summary: {
                core_summary: string;
            };
        };
    };
}

export interface ParsingResponse {
    items: ParsingItem[];
    errors: string[];
}

// 테이블 출력을 위한 평탄화된 데이터 타입
export interface TableRowData {
    id: string;
    name: string;
    birth: string;
    phone: string;
    email: string;
    position: string;
    channel: string;
    isDuplicate: boolean;
    criteriaMet: boolean;
    raw: ParsingItem; // 상세 보기 모달용 원본 데이터
}