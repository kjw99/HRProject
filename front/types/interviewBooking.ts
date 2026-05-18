export interface AvailableInterviewSlot {
  slotId: number;
  interviewRound: string;
  interviewStartsAt: string;
  interviewEndsAt: string;
  interviewLocation: string | null;
  remainingCapacity: number;
}

export interface InterviewBookingPayload {
  candidateId: number;
  slotId: number;
}

export interface InterviewBookingCancelPayload {
  candidateId: number;
}

export interface InterviewBookingResponse {
  bookingId: number;
  candidateId: number;
  slotId: number;
  interviewStartsAt: string;
  interviewEndsAt: string;
  interviewLocation: string | null;
  createdAt: string;
}

export interface InterviewBookingMutationResponse {
  message: string;
}
