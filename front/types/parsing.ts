export type ResumeParseJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface ParsingFileError {
  filename: string;
  detail: string;
}

export interface ParseJobCreateResponse {
  jobId: string;
  status: ResumeParseJobStatus;
  totalFiles: number;
  processedFiles: number;
}

export interface ParseJobResponse extends ParseJobCreateResponse {
  result: ParsingResponse | null;
  error: string | null;
}

/**
 * 이력서 파싱 결과 전체 응답
 */
export interface ParsingResponse {
  items: ParsingItem[];
  errors: ParsingFileError[];
  excelBase64: string | null;
  excelFileName: string | null;
}

/**
 * 💡 개별 파일 파싱 결과 아이템
 */
export interface ParsingItem {
    filename: string;
    record: ParsingRecord;
}

export interface ParsingRecord {
    candidateId: number;
    resumeId: number;
    positionMatch: PositionMatch;
    candidate: CandidateBasicInfo;
    resume: ResumeSummary;
    parsedJson: DetailedParsedData; // 원문 추출 데이터
    aiProfile: AIProfile;           // AI 분석/요약 데이터
}
/* ==========================================
      1. 기본 정보 및 매칭 관련 인터페이스
========================================== */

export interface PositionMatch {
    status: 'notProvided' | 'matched' | 'noMatch' | string;
    rawPosition: string | null;
    matchedPositionId: number | null;
    matchedPositionName: string | null;
    candidates: any[];
    reason: string;
}


export interface CandidateBasicInfo {
    candidateId: number;
    positionId: number | null;
    name: string;
    dateOfBirth: string;
    gender: '남' | '여' | null;
    address: string;
    phone: string;
    email: string | null;
    experienceLevel: '경력' | '신입' | string;
    applicationStatus: string;
    finalStatus: string;
    meetsPreferredCriteria: string[];
}

export interface ResumeSummary {
    resumeId: number;
    candidateId: number;
    desiredLocation: string | null;
    desiredSalary: number | null;
    filePath: string;
    summary: string;
}

/* ==========================================
      2. 원문 추출 데이터 (DetailedParsedData)
========================================== */

export interface DetailedParsedData {
    schema_version: string;
    personal_info: {
        name: string;
        birth_date: string;
        gender: string | null;
        address: string;
        phone: string;
        email: string | null;
        applied_position: any; // 문자열일 수도 있고 객체일 수도 있음
    };
    desired_conditions: {
        desired_location: string | null;
        desired_salary: string | null;
    };
    education: EducationHistory[];
    military_service: string | null;
    careers: CareerHistory[];
    certifications: any[];
    job_related_activities: any[];
    cover_letters: CoverLetter[];
    skills: string[];
    extraction_meta: {
        language: string;
        confidence: number;
        warnings: string[];
    };
}

export interface EducationHistory {
    education_level: string;
    school_name: string;
    major: string;
    period: DatePeriod;
    location: string;
    gpa: {
        score: number;
        max_score: number;
        raw: string;
    } | null;
}

export interface CareerHistory {
    company_name: string;
    department: string;
    employment_type: string | null;
    is_company_employment: boolean;
    exclusion_reason: string | null;
    annual_salary: string | null;
    position: string;
    resignation_reason: string | null;
    period: DatePeriod;
    responsibilities: string[];
}

export interface DatePeriod {
    raw: string;
    start_date: string;
    end_date: string | 'present';
}

export interface CoverLetter {
    title: string;
    content: string;
}

/* ==========================================
      3. AI 분석 프로필 (AIProfile)
========================================== */

export interface AIProfile {
    schema_version: string;
    target_position: string;
    candidate_summary: {
        career_level: string;
        total_experience_months: number | null;
        current_or_latest_role: string;
        core_summary: string;
    };
    skills: {
        programming_languages: string[];
        frameworks: string[];
        databases: string[];
        tools: string[];
        domains: string[];
        other: string[];
    };
    experience_highlights: ExperienceHighlight[];
    education_summary: {
        highest_level: string;
        major: string;
        relevant_notes: string[];
    };
    certifications: any[];
    cover_letter_insights: CoverLetterInsight[];
    strengths_to_probe: string[];
    risk_or_unclear_points: string[];
    recommended_question_topics: string[];
}

export interface ExperienceHighlight {
    title: string;
    organization: string;
    period_summary: string;
    role: string;
    tech_stack: string[];
    responsibilities: string[];
    achievements: string[];
    question_focus: string[];
}

export interface CoverLetterInsight {
    theme: string;
    claim: string;
    question_focus: string;
}

// 테이블 출력을 위한 평탄화된 데이터 타입
export interface TableRowData {
    id: string;
    name: string;
    birth: string;
    phone: string;
    email: string;
    position: string;
    channel: string;
    isDuplicate: boolean;
    criteriaMet: boolean;
    raw: ParsingItem; // 상세 보기 모달용 원본 데이터
}