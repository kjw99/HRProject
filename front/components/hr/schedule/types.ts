import { Applicant } from "@/types/applicant";
import {
  InterviewRoundWrite,
  InterviewSlotDetailItem,
  InterviewSlotListItem,
} from "@/types/interviewSlotWrite";
import { HrInterviewer } from "@/types/interviewer";
import { Position } from "@/types/position";

/** `/hr/schedule` SSR → 클라이언트로 전달되는 초기 데이터 */
export interface ScheduleClientInitialData {
  initialSlots: InterviewSlotListItem[];
  initialPositions: Position[];
  initialApplicants: Applicant[];
  initialInterviewers: HrInterviewer[];
  /** `yyyy-MM` (서버에서 date-fns format) */
  initialMonth: string;
}

export type ScheduleCalendarViewMode = "month" | "week";

export type ScheduleSlotFormMode = "create" | "edit";

export interface ScheduleSlotFormState {
  positionId: string;
  interviewRound: InterviewRoundWrite;
  interviewerIds: number[];
  interviewDate: string;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewLocation: string;
  capacity: string;
}
