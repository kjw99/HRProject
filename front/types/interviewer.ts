// Position (직무/부서) — camelCase
export interface BackendPosition {
  positionId: number;
  positionName: string;
  createdAt: string;
}

// Candidate (지원자) — snake_case
export interface BackendCandidate {
  candidate_id: number;
  position_id: number | null;
  name: string | null;
  application_status: string;
  final_status: string;
  experience_level: string;
  meets_preferred_criteria: string[];
}

// Generated question — camelCase
export interface BackendGeneratedQuestion {
  questionText: string;
  questionType: string;
  evaluationIntent: string;
  generationBasis: string; // 💡 새로 추가된 필드 (생성 근거)
}

// 💡 프론트엔드 상태 관리를 위한 확장 타입 (React 배열 렌더링용 고유 키 추가)
export interface UIGeneratedQuestion extends BackendGeneratedQuestion {
  id: string;
}

// API 요청 페이로드
export interface QuestionGeneratePayload {
  candidateId: number;
  positionId?: number;
  questionCount?: number;
  additionalRequest?: string;
}

export interface QuestionSavePayload {
  positionId?: number;
  candidateId?: number;
  questions: Array<{
    questionText: string;
    questionType?: string;
    evaluationIntent?: string;
    generationBasis?: string;
  }>;
}
