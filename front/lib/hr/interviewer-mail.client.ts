import { InterviewerMailPayload, InterviewerMailResponse } from "@/types/interviewer";
import { api } from "../api";

export const interviewerMailApi = {
  sendInterviewerMail: async (
    interviewerId: number,
    payload: InterviewerMailPayload,
  ): Promise<InterviewerMailResponse> => {
    // SMTP delivery can exceed the global axios 10s timeout in production.
    // Use a longer timeout for this endpoint only.
    const response = await api.post<
      InterviewerMailResponse & {
        invite_url?: string;
        expires_at?: string | null;
      }
    >(`/api/interviewers/${interviewerId}/email`, payload, {
      timeout: 45000,
    });

    return {
      message: response.data.message,
      inviteUrl: response.data.inviteUrl ?? response.data.invite_url,
      expiresAt: response.data.expiresAt ?? response.data.expires_at,
    };
  },
};
