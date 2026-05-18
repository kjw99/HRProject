export interface Applicant {
  candidate_id: number; // 기존 id -> candidate_id (number형)
  position_id: number | null; // 지원 공고 ID
  position_name?: string | null;
  name: string;
  date_of_birth: string; // "YYYY-MM-DD"
  gender: string | null; // null 허용
  address: string;
  phone: string;
  email: string | null; // null 허용

  // 경력 구분: 서버 데이터 기준
  experience_level: "신입" | "경력" | "무관";

  // 지원 단계 (예: 서류, 면접 등)
  application_status: "서류" | "면접" | "최종합격" | "불합격";

  // 최종 상태 (예: 진행중, 완료 등)
  final_status: "진행중" | "합격" | "불합격";

  // 우대 조건 충족 리스트
  meets_preferred_criteria: string[];
}

export interface ApplicantListResponse {
  content: Applicant[];
}

export interface ApplicantUpdatePayload {
  position_id?: number;
  name?: string;
  date_of_birth?: string;
  gender?: string | null;
  address?: string;
  phone?: string;
  email?: string | null;
  experience_level?: "신입" | "경력" | "무관";
  application_status?: "서류" | "면접" | "최종합격" | "불합격";
  final_status?: "진행중" | "합격" | "불합격";
  meets_preferred_criteria?: string[];
}

export interface ApplicantMutationResponse {
  message: string;
}

export interface ApplicantInvitationHistory {
  invitation_id: number;
  candidate_id: number;
  slot_ids: number[];
  expires_at: string | null;
  created_at: string | null;
  revoked_at: string | null;
}

export interface ApplicantCurrentBooking {
  booking_id: number;
  candidate_id: number;
  slot_id: number;
  interview_round: string | null;
  interview_starts_at: string | null;
  interview_ends_at: string | null;
  interview_location: string | null;
  position_name: string | null;
  created_at: string | null;
  cancelled_at: string | null;
}

export interface ApplicantDetail extends Applicant {
  position_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  current_booking?: ApplicantCurrentBooking | null;
  booking_invitations: ApplicantInvitationHistory[];
}
