import { InterviewerMailPayload, InterviewerMailResponse } from "@/types/interviewer";

export const interviewerMailApi = {
  sendInterviewerMail: async (
    interviewerId: number,
    payload: InterviewerMailPayload,
  ): Promise<InterviewerMailResponse> => {
    const response = await fetch(`/api/interviewers/${interviewerId}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as InterviewerMailResponse & {
      invite_url?: string;
      expires_at?: string | null;
      detail?: string;
    };

    if (!response.ok) {
      throw new Error(
        (typeof data.message === "string" && data.message) ||
          (typeof data.detail === "string" && data.detail) ||
          "Failed to send interviewer mail.",
      );
    }

    return {
      message: data.message,
      inviteUrl: data.inviteUrl ?? data.invite_url,
      expiresAt: data.expiresAt ?? data.expires_at,
    };
  },
};
