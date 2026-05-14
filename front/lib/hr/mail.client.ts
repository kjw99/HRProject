import { api } from "../api";

export interface CandidateMailPayload {
  subject: string;
  content: string;
}

export interface MessageResponse {
  message: string;
}

export const candidateMailApi = {
  sendCandidateMail: async (
    candidateId: number,
    payload: CandidateMailPayload,
  ): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(
      `/api/mail-send/${candidateId}`,
      payload,
    );
    return response.data;
  },
};
