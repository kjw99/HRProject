export const QUESTION_GENERATION_POLL_INTERVAL_MS = 1500;

export const QUESTION_GENERATION_TOAST_ID = "question-generation-job";

export const QUESTION_GENERATION_STATUS_LABEL: Record<string, string> = {
  idle: "대기",
  queued: "작업 대기열",
  running: "AI 질문 생성 중",
  succeeded: "완료",
  failed: "실패",
  cancelled: "취소됨",
};

export function questionGenerationPercent(status: string): number {
  switch (status) {
    case "queued":
      return 20;
    case "running":
      return 65;
    case "succeeded":
      return 100;
    default:
      return 0;
  }
}
