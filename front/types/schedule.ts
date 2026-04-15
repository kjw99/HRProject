export type InterviewStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
export type InterviewType = 'ONLINE' | 'OFFLINE';

export interface InterviewEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm AM/PM
    type: InterviewType;
    status: InterviewStatus;
    locationOrLink: string; // 화상 링크 또는 오프라인 주소
    interviewerInfo?: string;
    preparation?: string[];
}

export interface ScheduleData {
    applicantName: string;
    upcomingCount: number;
    events: InterviewEvent[];
}