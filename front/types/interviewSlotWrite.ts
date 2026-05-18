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

export interface InterviewSlotDetailItem extends InterviewSlotListItem {
  bookingDeadlineAt: string | null;
  remainingCapacity: number;
}
