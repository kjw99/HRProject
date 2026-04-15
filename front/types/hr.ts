export interface JobPosting {
  id: string;
  title: string;
  department: string;
  level: string;
  keySkills: string[];
}

export interface Candidate {
  id: string;
  name: string;
  appliedJob: string;
  resumeSummary: string;
  status?: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected'; // 파이프라인 상태 추가
  fitScore?: number; // AI 적합도 점수 추가
}

export interface GeneratedQuestion {
  id: number;
  type: string;
  question: string;
  intent: string;
  ragContext: string;
}

export interface CandidateInsight {
  strengths: string[];
  risks: string[];
  scorecard: string[];
}