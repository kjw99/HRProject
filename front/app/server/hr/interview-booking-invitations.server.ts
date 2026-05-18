import "server-only";

import {
  InterviewBookingInvitationCreatePayload,
  InterviewBookingInvitationCreateResponse,
  InterviewBookingInvitationMutationResponse,
  InterviewBookingInvitationTokenBookingPayload,
} from "@/types/interviewBookingInvitation";
import {
  AvailableInterviewSlot,
  InterviewBookingResponse,
} from "@/types/interviewBooking";
import { apiServer } from "../axios-server";

export const createInterviewBookingInvitationServer = async (
  payload: InterviewBookingInvitationCreatePayload,
): Promise<InterviewBookingInvitationCreateResponse> => {
  const response = await apiServer.post<InterviewBookingInvitationCreateResponse>(
    "/api/interview-booking-invitations",
    payload,
  );
  return response.data;
};

export const revokeInterviewBookingInvitationServer = async (
  invitationId: number,
): Promise<InterviewBookingInvitationMutationResponse> => {
  const response = await apiServer.patch<InterviewBookingInvitationMutationResponse>(
    `/api/interview-booking-invitations/${invitationId}/revoke`,
  );
  return response.data;
};

export const fetchInvitationAvailableSlotsServer = async (
  token: string,
): Promise<AvailableInterviewSlot[]> => {
  const response = await apiServer.get<AvailableInterviewSlot[]>(
    `/api/interview-booking-invitations/${token}/available-slots`,
  );
  return response.data;
};

export const createInterviewBookingByInvitationServer = async (
  token: string,
  payload: InterviewBookingInvitationTokenBookingPayload,
): Promise<InterviewBookingResponse> => {
  const response = await apiServer.post<InterviewBookingResponse>(
    `/api/interview-booking-invitations/${token}/bookings`,
    payload,
  );
  return response.data;
};
