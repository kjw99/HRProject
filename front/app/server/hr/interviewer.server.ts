import "server-only";

import {
  HrInterviewer,
  InterviewerListParams,
  InterviewerListResponse,
  InterviewerMutationResponse,
  InterviewerPayload,
} from "@/types/interviewer";
import { apiServer } from "../axios-server";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const normalizeListResponse = (
  data: HrInterviewer[] | InterviewerListResponse,
): InterviewerListResponse => {
  if (Array.isArray(data)) {
    return { content: data };
  }

  return {
    content: data.content ?? [],
    page: data.page,
    size: data.size,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
  };
};

export const fetchInterviewersServer = async (
  params: InterviewerListParams = {},
): Promise<InterviewerListResponse> => {
  try {
    const response = await apiServer.get<
      HrInterviewer[] | InterviewerListResponse
    >("/api/interviewers", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 100,
        keyword: params.keyword || undefined,
        positionId: params.positionId,
        interviewRound: params.interviewRound,
      },
    });

    return normalizeListResponse(response.data);
  } catch (error: unknown) {
    console.warn(
      "[Server API] 면접관 목록 로드 실패. 빈 목록을 반환합니다.",
      getErrorMessage(error),
    );
    return { content: [] };
  }
};

export const fetchInterviewerServer = async (
  interviewerId: number,
): Promise<HrInterviewer | null> => {
  try {
    const response = await apiServer.get<HrInterviewer>(
      `/api/interviewers/${interviewerId}`,
    );
    return response.data;
  } catch (error: unknown) {
    console.warn(
      "[Server API] 면접관 상세 로드 실패.",
      interviewerId,
      getErrorMessage(error),
    );
    return null;
  }
};

export const createInterviewerServer = async (
  data: InterviewerPayload,
): Promise<HrInterviewer> => {
  const response = await apiServer.post<HrInterviewer>("/api/interviewers", data);
  return response.data;
};

export const updateInterviewerServer = async (
  interviewerId: number,
  data: Partial<InterviewerPayload>,
): Promise<HrInterviewer> => {
  const response = await apiServer.patch<HrInterviewer>(
    `/api/interviewers/${interviewerId}`,
    data,
  );
  return response.data;
};

export const deleteInterviewerServer = async (
  interviewerId: number,
): Promise<InterviewerMutationResponse> => {
  const response = await apiServer.delete<InterviewerMutationResponse>(
    `/api/interviewers/${interviewerId}`,
  );
  return response.data;
};
