import { api } from "@/lib/api";
import type { HrSavedQuestion } from "@/types/hr-questions";

export async function fetchHrQuestionsByPosition(
  positionId: number,
): Promise<HrSavedQuestion[]> {
  const { data } = await api.get<HrSavedQuestion[]>("/api/questions", {
    params: { positionId },
  });
  return data;
}

/** `GET /api/questions` (필터 없음) — 부서별 질문 개수 집계용 */
export async function fetchHrQuestionsAll(): Promise<HrSavedQuestion[]> {
  const { data } = await api.get<HrSavedQuestion[]>("/api/questions");
  return data;
}
