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

/** `DELETE /api/questions/{question_id}` */
export async function deleteHrQuestion(questionId: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/api/questions/${questionId}`,
  );
  return data;
}

export async function deleteHrQuestions(questionIds: number[]): Promise<void> {
  await Promise.all(questionIds.map((id) => deleteHrQuestion(id)));
}
