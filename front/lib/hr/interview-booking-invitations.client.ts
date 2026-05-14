import {
  InterviewBookingInvitationTokenBookingPayload,
  InterviewBookingInvitationCreatePayload,
  InterviewBookingInvitationCreateResponse,
} from "@/types/interviewBookingInvitation";
import {
  AvailableInterviewSlot,
  InterviewBookingResponse,
} from "@/types/interviewBooking";
import { api } from "../api";

export const interviewBookingInvitationApi = {
  /**
   * 면접 예약 초대 링크 생성 (지원자가 토큰으로 슬롯 선택·예약)
   * POST /api/interview-booking-invitations
   */
  createInvitation: async (
    payload: InterviewBookingInvitationCreatePayload,
  ): Promise<InterviewBookingInvitationCreateResponse> => {
    const response = await api.post<InterviewBookingInvitationCreateResponse>(
      "/api/interview-booking-invitations",
      payload,
    );
    return response.data;
  },

  fetchAvailableSlotsByToken: async (
    token: string,
  ): Promise<AvailableInterviewSlot[]> => {
    const response = await api.get<AvailableInterviewSlot[]>(
      `/api/interview-booking-invitations/${token}/available-slots`,
    );
    return response.data;
  },

  createBookingByToken: async (
    token: string,
    payload: InterviewBookingInvitationTokenBookingPayload,
  ): Promise<InterviewBookingResponse> => {
    const response = await api.post<InterviewBookingResponse>(
      `/api/interview-booking-invitations/${token}/bookings`,
      payload,
    );
    return response.data;
  },
};
