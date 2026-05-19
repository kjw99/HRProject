import {
  ActiveBookingSummary,
  AvailableInterviewSlot,
  InterviewBookingCancelPayload,
  InterviewBookingMutationResponse,
  InterviewBookingPayload,
  InterviewBookingResponse,
} from "@/types/interviewBooking";
import { api } from "../api";

export const interviewBookingApi = {
  fetchAvailableSlots: async (
    candidateId: number,
  ): Promise<AvailableInterviewSlot[]> => {
    const response = await api.get<AvailableInterviewSlot[]>(
      "/api/interview-bookings/available-slots",
      {
        params: { candidateId },
      },
    );

    return response.data;
  },

  createBooking: async (
    payload: InterviewBookingPayload,
  ): Promise<InterviewBookingResponse> => {
    const response = await api.post<InterviewBookingResponse>(
      "/api/interview-bookings",
      payload,
    );

    return response.data;
  },

  cancelBooking: async (
    bookingId: number,
    payload: InterviewBookingCancelPayload,
  ): Promise<InterviewBookingMutationResponse> => {
    const response = await api.patch<InterviewBookingMutationResponse>(
      `/api/interview-bookings/${bookingId}/cancel`,
      payload,
    );

    return response.data;
  },

  /**
   * 직무에 걸린 활성(미취소) booking 일괄 조회.
   * 같은 직무 지원자 카드에서 "다른 슬롯에 배정됨" 라벨을 그리는 데 사용.
   */
  fetchActiveBookingsByPosition: async (
    positionId: number,
  ): Promise<ActiveBookingSummary[]> => {
    const response = await api.get<ActiveBookingSummary[]>(
      "/api/interview-bookings/active",
      { params: { positionId } },
    );
    return response.data;
  },
};
