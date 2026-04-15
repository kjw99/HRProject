// ==========================================
// 🏷️ 1. 공통 Enum / Union Types
// ==========================================
export type ChatRole = 'ai' | 'user';
export type FeedbackRating = 'Excellent' | 'Good' | 'Needs Improvement';

// ==========================================
// 💬 2. AI 면접 세션 (Interview Session)
// ==========================================
export interface InterviewMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;         // HH:mm 포맷
}

// ==========================================
// 📊 3. AI 역량 분석 리포트 (Report)
// ==========================================
export interface Competency {
  label: string;             // 역량명 (예: 기술 전문성, 의사소통)
  score: number;             // 0 ~ 100 점수
}

export interface QuestionFeedback {
  id: string;
  question: string;          // AI가 던진 질문
  myAnswerSummary: string;   // 지원자 답변 요약
  aiComment: string;         // AI의 상세 피드백
  rating: FeedbackRating;    // 평가 등급
}

export interface CandidateReport {
  applicantId: string;       // 지원자 고유 ID
  applicantName: string;     // 지원자 이름
  appliedJob: string;        // 지원 직무
  overallScore: number;      // 총점 (0~100)
  summary: string;           // 총평 (한 줄 요약)
  competencies: Competency[];// 방사형(레이더) 차트용 데이터
  strengths: string[];       // 주요 강점 리스트
  weaknesses: string[];      // 보완 포인트 리스트
  feedbacks: QuestionFeedback[]; // 문항별 상세 피드백
}