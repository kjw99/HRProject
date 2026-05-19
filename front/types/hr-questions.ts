import type { Position } from "@/types/position";

/**
 * 질문 조회 화면 좌측에서 선택하는 부서(직무).
 * 백엔드 `Position`과 동일 스키마이며, UI에서는 “부서”로 표기합니다.
 */
export type HrDepartmentOption = Position;

/**
 * `GET /api/questions` 응답 한 건 (FastAPI `QuestionResponse` + camelCase).
 */
export interface HrSavedQuestion {
  questionId: number;
  candidateId: number | null;
  candidateName?: string | null;
  positionId: number | null;
  questionText: string;
  questionType: string;
  evaluationIntent: string | null;
  generationBasis: string | null;
  createdAt: string;
}
