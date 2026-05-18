import "server-only";

import {
  InterviewSlotDetailItem,
  InterviewSlotListItem,
} from "@/types/interviewSlotWrite";
import { apiServer } from "../axios-server";

export interface InterviewSlotListParams {
  year?: number;
  month?: number;
  day?: number;
  positionId?: number;
}

export const fetchInterviewSlotsServer = async (
  params: InterviewSlotListParams = {},
): Promise<InterviewSlotListItem[]> => {
  try {
    const response = await apiServer.get<InterviewSlotListItem[]>(
      "/api/interview-slots",
      { params },
    );
    return response.data;
  } catch (error) {
    console.warn("[Server API] 면접 일정 목록 로드 실패.", error);
    return [];
  }
};

export const fetchInterviewSlotDetailServer = async (
  slotId: number,
): Promise<InterviewSlotDetailItem | null> => {
  try {
    const response = await apiServer.get<InterviewSlotDetailItem>(
      `/api/interview-slots/${slotId}`,
    );
    return response.data;
  } catch (error) {
    console.warn("[Server API] 면접 일정 상세 로드 실패.", slotId, error);
    return null;
  }
};
