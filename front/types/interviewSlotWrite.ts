export type InterviewRoundWrite = "1차" | "2차" | "3차";
export type InterviewSlotStatus = "open" | "full" | "closed";

/** POST /api/interview-slots, /batch 요청 바디 (camelCase) */
export interface InterviewSlotCreatePayload {
  positionId: number;
  interviewRound: InterviewRoundWrite;
  interviewerIds: number[];
  interviewDate: string;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewLocation: string;
  capacity: number;
}

export type InterviewSlotUpdatePayload = Partial<InterviewSlotCreatePayload>;

export interface InterviewSlotBatchPayload {
  slots: InterviewSlotCreatePayload[];
}

export interface InterviewSlotMutationItem {
  slotId: number;
  positionId: number | null;
  interviewRound: string;
  interviewerIds: number[];
  interviewStartsAt: string;
  interviewEndsAt: string;
  bookingDeadlineAt: string | null;
  interviewLocation: string | null;
  capacity: number;
  slotStatus: InterviewSlotStatus;
  createdAt: string;
}

export interface InterviewSlotListItem {
  slotId: number;
  positionName: string | null;
  interviewerNames: string[];
  bookedCandidateNames: string[];
  interviewRound: string;
  interviewStartsAt: string;
  interviewEndsAt: string;
  slotStatus: InterviewSlotStatus;
  interviewLocation: string | null;
}

export interface BookedCandidateSummary {
  bookingId: number;
  candidateId: number;
  candidateName: string;
  bookedAt: string | null;
}

export interface InterviewSlotDetailItem extends InterviewSlotListItem {
  bookingDeadlineAt: string | null;
  remainingCapacity: number;
  /** 활성 예약 목록 (취소 가능한 식별자 포함). 백엔드가 응답하지 않을 경우 빈 배열로 정규화 */
  bookedCandidates: BookedCandidateSummary[];
}
