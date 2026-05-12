import apiClient from '@/lib/apiClient';

// Position (직무/부서) — CaseModel → camelCase
export interface BackendPosition {
  positionId: number;
  positionName: string;
  createdAt: string;
}

// Candidate (지원자) — no CaseModel → snake_case
export interface BackendCandidate {
  candidate_id: number;
  position_id: number | null;
  name: string | null;
  application_status: string;
  final_status: string;
  experience_level: string;
  meets_preferred_criteria: string[];
}

// Generated question — CaseModel → camelCase
export interface BackendGeneratedQuestion {
  questionText: string;
  questionType: string;
  evaluationIntent: string;
  generationBasis: string;
}

export interface QuestionGeneratePayload {
  candidateId: number;
  positionId?: number;
  questionCount?: number;
  additionalRequest?: string;
}

export interface QuestionSavePayload {
  positionId?: number;
  candidateId?: number;
  questions: Array<{
    questionText: string;
    questionType?: string;
    evaluationIntent?: string;
    generationBasis?: string;
  }>;
}

export const questionApi = {
  getPositions: (): Promise<BackendPosition[]> =>
    apiClient.get('/api/positions') as unknown as Promise<BackendPosition[]>,

  getCandidates: (): Promise<BackendCandidate[]> =>
    apiClient.get('/api/candidates') as unknown as Promise<BackendCandidate[]>,

  generateQuestions: (data: QuestionGeneratePayload): Promise<BackendGeneratedQuestion[]> =>
    apiClient.post('/api/questions/generate', data) as unknown as Promise<BackendGeneratedQuestion[]>,

  saveQuestions: (data: QuestionSavePayload): Promise<{ message: string }> =>
    apiClient.post('/api/questions', data) as unknown as Promise<{ message: string }>,
};
