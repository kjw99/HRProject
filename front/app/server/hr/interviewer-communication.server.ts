import "server-only";

import {
  InterviewerInviteAcceptPayload,
  InterviewerInviteAcceptResponse,
  InterviewerInvitePayload,
  InterviewerInviteResponse,
  InterviewerMailPayload,
  InterviewerMailResponse,
} from "@/types/interviewer";
import { apiServer } from "../axios-server";

export const createInterviewerInviteServer = async (
  payload: InterviewerInvitePayload,
): Promise<InterviewerInviteResponse> => {
  const response = await apiServer.post<InterviewerInviteResponse>(
    "/api/interviewer-invites",
    payload,
  );
  return response.data;
};

export const acceptInterviewerInviteServer = async (
  payload: InterviewerInviteAcceptPayload,
): Promise<InterviewerInviteAcceptResponse> => {
  const response = await apiServer.post<InterviewerInviteAcceptResponse>(
    "/api/interviewer-invites/accept",
    payload,
  );
  return response.data;
};

export const sendInterviewerMailServer = async (
  interviewerId: number,
  payload: InterviewerMailPayload,
): Promise<InterviewerMailResponse> => {
  const response = await apiServer.post<
    InterviewerMailResponse & {
      invite_url?: string;
      expires_at?: string | null;
    }
  >(`/api/interviewers/${interviewerId}/email`, payload);

  return {
    message: response.data.message,
    inviteUrl: response.data.inviteUrl ?? response.data.invite_url,
    expiresAt: response.data.expiresAt ?? response.data.expires_at,
  };
};
