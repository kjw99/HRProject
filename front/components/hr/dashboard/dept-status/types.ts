/** AssignInterviewerModal 등에서 공유 */
export interface UpcomingInterview {
  id: string;
  date: string;
  team: string;
  round: string;
  expType: "신입" | "경력" | "무관";
  intervieweeCount: number;
  applicantCount: number;
}
