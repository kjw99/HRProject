import "server-only";

import {
  AvailableInterviewSlot,
  InterviewBookingCancelPayload,
  InterviewBookingMutationResponse,
  InterviewBookingPayload,
  InterviewBookingResponse,
} from "@/types/interviewBooking";
import { apiServer } from "../axios-server";

export const fetchAvailableInterviewSlotsServer = async (
  candidateId: number,
): Promise<AvailableInterviewSlot[]> => {
  const response = await apiServer.get<AvailableInterviewSlot[]>(
    "/api/interview-bookings/available-slots",
    {
      params: { candidateId },
    },
  );
  return response.data;
};

export const createInterviewBookingServer = async (
  payload: InterviewBookingPayload,
): Promise<InterviewBookingResponse> => {
  const response = await apiServer.post<InterviewBookingResponse>(
    "/api/interview-bookings",
    payload,
  );
  return response.data;
};

export const cancelInterviewBookingServer = async (
  bookingId: number,
  payload: InterviewBookingCancelPayload,
): Promise<InterviewBookingMutationResponse> => {
  const response = await apiServer.patch<InterviewBookingMutationResponse>(
    `/api/interview-bookings/${bookingId}/cancel`,
    payload,
  );
  return response.data;
};
