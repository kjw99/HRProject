import {
  BackendCandidate,
  BackendGeneratedQuestion,
  BackendPosition,
  QuestionGeneratePayload,
  QuestionSavePayload,
} from "@/types/interviewer";
import { api } from "../api";

/** LangGraph 다단계 호출은 기본 api 타임아웃(10s)을 쉽게 넘깁니다. */
const QUESTION_GENERATE_TIMEOUT_MS = 180_000;

export const question = {
  getPositions: async (): Promise<BackendPosition[]> => {
    const { data } = await api.get<BackendPosition[]>("/api/positions");
    return data;
  },

  getCandidates: async (): Promise<BackendCandidate[]> => {
    const { data } = await api.get<BackendCandidate[]>("/api/candidates");
    return data;
  },

  generateQuestions: async (
    data: QuestionGeneratePayload,
  ): Promise<BackendGeneratedQuestion[]> => {
    const { data: body } = await api.post<BackendGeneratedQuestion[]>(
      "/api/questions/generate",
      data,
      { timeout: QUESTION_GENERATE_TIMEOUT_MS },
    );
    return body;
  },

  saveQuestions: async (
    data: QuestionSavePayload,
  ): Promise<{ message: string }> => {
    const { data: body } = await api.post<{ message: string }>(
      "/api/questions",
      data,
    );
    return body;
  },
};
