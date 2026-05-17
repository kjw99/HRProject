import {
  InterviewerInviteAcceptPayload,
  InterviewerInviteAcceptResponse,
  InterviewerInvitePayload,
  InterviewerInviteResponse,
} from "@/types/interviewer";
import { api } from "../api";

export const interviewerInviteApi = {
  createInvite: async (
    payload: InterviewerInvitePayload,
  ): Promise<InterviewerInviteResponse> => {
    const response = await api.post<InterviewerInviteResponse>(
      "/api/interviewer-invites",
      payload,
    );
    return response.data;
  },

  acceptInvite: async (
    payload: InterviewerInviteAcceptPayload,
  ): Promise<InterviewerInviteAcceptResponse> => {
    const response = await api.post<InterviewerInviteAcceptResponse>(
      "/api/interviewer-invites/accept",
      payload,
    );
    return response.data;
  },
};
