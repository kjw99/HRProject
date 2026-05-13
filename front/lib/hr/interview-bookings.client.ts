import {
  AvailableInterviewSlot,
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
};
