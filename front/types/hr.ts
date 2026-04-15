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
  status?: "applied" | "screening" | "interview" | "offered" | "rejected"; // 파이프라인 상태 추가
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

export type ApplicantStatus =
  | "DOCUMENT_PASSED" // 서류 합격 (면접 배정 가능 상태)
  | "INTERVIEW_SCHEDULED" // 면접 일정 배정됨
  | "INTERVIEW_COMPLETED" // 면접 완료
  | "REJECTED" // 탈락
  | "HIRED"; // 최종 합격

// 💡 특정 상태의 지원자만 다룰 때 사용하는 확장 타입 (예: 서류 합격자 전용)
export interface PassedApplicant extends Applicant {
  status: "DOCUMENT_PASSED";
}

export type EventType = "INTERVIEW" | "CODING_TEST" | "HR_MEETING";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: "INTERVIEW" | "CODING_TEST" | "HR_MEETING";
  candidates: Applicant[]; // 💡 Candidate 대신 Applicant로 통일
}

// ==========================================
// 🧑‍💼 2. 지원자 (Applicant/Candidate) 정보
// ==========================================
export interface Applicant {
  id: string;
  name: string;
  email: string;
  position: string;          // 지원 직무 (예: FE 개발자)
  status: ApplicantStatus;   // 현재 전형 상태
  avatar?: string;           // 프로필 이미지 URL (선택)
}

// 💡 서류 합격자 전용 타입 (기존 PassedApplicant를 명확히 함)
export interface PassedApplicant extends Applicant {
  status: 'DOCUMENT_PASSED';
}

// ==========================================
// 📅 3. 캘린더 및 일정 (Calendar / Schedule)
// ==========================================
export interface CalendarEvent {
  id: string;                // 일정 고유 ID
  title: string;             // 일정명 (예: 백엔드 1차 기술 면접)
  date: string;              // YYYY-MM-DD
  startTime: string;         // HH:mm
  endTime: string;           // HH:mm
  type: EventType;           // 일정 종류
  location: string;          // 화상 링크 또는 오프라인 회의실
  candidates: Applicant[];   // 해당 일정에 배정된 지원자 목록
  interviewerInfo?: string;  // 면접관 정보 (선택)
  preparation?: string[];    // 지원자 사전 준비사항 (선택)
}

// HR 대시보드 요약 데이터용
export interface HrDashboardSummary {
  activeEventsCount: number;
  pendingApplicantsCount: number;
  todayEvents: CalendarEvent[];
}