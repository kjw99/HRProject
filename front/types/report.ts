export interface Competency {
    label: string;
    score: number;
}

export interface Feedback {
    id: string;
    question: string;
    myAnswerSummary: string;
    aiComment: string;
    rating: 'Excellent' | 'Good' | 'Needs Improvement';
}

export interface CandidateReport {
    applicantName: string;
    appliedJob: string;
    overallScore: number;
    summary: string;
    competencies: Competency[];
    strengths: string[];
    weaknesses: string[];
    feedbacks: Feedback[];
}