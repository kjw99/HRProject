import {
  BackendCandidate,
  BackendGeneratedQuestion,
  BackendPosition,
  QuestionGeneratePayload,
  QuestionGenerationJobCreateResponse,
  QuestionGenerationJobResponse,
  QuestionSavePayload,
} from "@/types/interviewer";
import { api } from "../api";

const QUESTION_JOB_POLL_INTERVAL_MS = 1500;
const QUESTION_JOB_TIMEOUT_MS = 180_000;
const TERMINAL_STATUSES = new Set(["succeeded", "failed", "cancelled"]);

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function waitForQuestionJob(
  jobId: number,
): Promise<QuestionGenerationJobResponse> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < QUESTION_JOB_TIMEOUT_MS) {
    const { data } = await api.get<QuestionGenerationJobResponse>(
      `/api/questions/generation-jobs/${jobId}`,
    );

    if (TERMINAL_STATUSES.has(data.status)) {
      return data;
    }

    await sleep(QUESTION_JOB_POLL_INTERVAL_MS);
  }

  throw new Error("Question generation timed out.");
}

export const question = {
  getPositions: async (): Promise<BackendPosition[]> => {
    const { data } = await api.get<BackendPosition[]>("/api/positions");
    return data;
  },

  getCandidates: async (): Promise<BackendCandidate[]> => {
    const { data } = await api.get<BackendCandidate[]>("/api/candidates");
    return data;
  },

  createGenerationJob: async (
    payload: QuestionGeneratePayload,
  ): Promise<QuestionGenerationJobCreateResponse> => {
    const { data } = await api.post<QuestionGenerationJobCreateResponse>(
      "/api/questions/generate",
      payload,
    );
    return data;
  },

  getGenerationJob: async (
    jobId: number,
  ): Promise<QuestionGenerationJobResponse> => {
    const { data } = await api.get<QuestionGenerationJobResponse>(
      `/api/questions/generation-jobs/${jobId}`,
    );
    return data;
  },

  getActiveGenerationJob: async (): Promise<QuestionGenerationJobResponse | null> => {
    const { data } = await api.get<QuestionGenerationJobResponse | null>(
      "/api/questions/generation-jobs/active",
    );
    return data;
  },

  generateQuestions: async (
    payload: QuestionGeneratePayload,
  ): Promise<BackendGeneratedQuestion[]> => {
    const job = await question.createGenerationJob(payload);
    const result = await waitForQuestionJob(job.jobId);

    if (result.status !== "succeeded") {
      throw new Error(
        result.errorMessage || "Question generation failed.",
      );
    }

    return result.resultQuestions ?? [];
  },

  saveQuestions: async (
    payload: QuestionSavePayload,
  ): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>(
      "/api/questions",
      payload,
    );
    return data;
  },
};
