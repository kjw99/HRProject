export type EventType = 'INTERVIEW' | 'CODING_TEST' | 'HR_MEETING';

export interface Candidate {
    id: string;
    name: string;
    position: string;
    email: string;
    avatar?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    startTime: string; // HH:mm
    endTime: string;
    type: EventType;
    date: string; // YYYY-MM-DD
    candidates: Candidate[];
    location: string;
}
export interface PassedApplicant {
    id: string;
    name: string;
    position: string;
    status: 'DOCUMENT_PASSED'; // 서류 합격 상태
}