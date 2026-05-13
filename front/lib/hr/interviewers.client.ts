import {
  HrInterviewer,
  InterviewerMutationResponse,
  InterviewerPayload,
} from "@/types/interviewer";
import { api } from "../api";

export const interviewerApi = {
  createInterviewer: async (data: InterviewerPayload): Promise<HrInterviewer> => {
    const response = await api.post<HrInterviewer>("/api/interviewers", data);
    return response.data;
  },

  updateInterviewer: async (
    interviewerId: number,
    data: Partial<InterviewerPayload>,
  ): Promise<HrInterviewer> => {
    const response = await api.patch<HrInterviewer>(
      `/api/interviewers/${interviewerId}`,
      data,
    );
    return response.data;
  },

  deleteInterviewer: async (
    interviewerId: number,
  ): Promise<InterviewerMutationResponse> => {
    const response = await api.delete<InterviewerMutationResponse>(
      `/api/interviewers/${interviewerId}`,
    );
    return response.data;
  },
};
