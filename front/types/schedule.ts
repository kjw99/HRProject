// GET 요청 시 사용할 Query Parameters (모두 optional)
export interface InterviewSlotParams {
  year?: string | number;
  month?: string | number;
  day?: string | number;
  positionId?: string | number;
}

// 응답받을 면접 슬롯 데이터 구조
export interface InterviewSlot {
  slotId: number;
  positionName: string;
  interviewerNames: string[];
  interviewRound: string; // 예: "1차", "2차", "최종"
  interviewStartsAt: string; // ISO String
  interviewEndsAt: string; // ISO String
  slotStatus: "open" | "closed" | string; // 상태값
  interviewLocation: string;
}
