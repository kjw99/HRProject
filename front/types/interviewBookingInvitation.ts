/** POST /api/interview-booking-invitations */
export interface InterviewBookingInvitationCreatePayload {
  candidateId: number;
  /** 비어 있으면 서버 기본 동작: 지원자의 모든 예약 가능 슬롯 노출 */
  slotIds?: number[];
  /** ISO-8601 with timezone (optional; 생략 시 서버 기본 만료) */
  expiresAt?: string;
}

export interface InterviewBookingInvitationCreateResponse {
  invitationId: number;
  candidateId: number;
  slotIds: number[];
  invitationUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface InterviewBookingInvitationTokenBookingPayload {
  slotId: number;
}

export interface InterviewBookingInvitationMutationResponse {
  message: string;
}
