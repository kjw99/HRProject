import { InterviewerMailPayload, InterviewerMailResponse } from "@/types/interviewer";
import { api } from "../api";

export const interviewerMailApi = {
  sendInterviewerMail: async (
    interviewerId: number,
    payload: InterviewerMailPayload,
  ): Promise<InterviewerMailResponse> => {
    const response = await api.post<
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
  },
};
