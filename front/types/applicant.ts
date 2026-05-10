export interface Applicant {
  id: string;
  experienceLevel: "신입" | "경력" | "무관";
  name: string;
  phone: string;
  department: string;
  appliedPosition: string;
  status: "합격" | "불합격" | "서류 심사 중" | "면접 진행 중";
  preferredCriteria: string[]; // 우대 조건 (자격증 등) 배열
}

export interface ApplicantListResponse {
  content: Applicant[];
  totalElements: number;
}
