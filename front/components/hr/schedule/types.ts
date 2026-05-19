import { Applicant } from "@/types/applicant";
import {
  InterviewRoundWrite,
  InterviewSlotDetailItem,
  InterviewSlotListItem,
  InterviewSlotStatus,
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

/** 일정 상태 시각 메타 */
export interface SlotStatusMeta {
  label: string;
  className: string;
  dotClassName: string;
}

export type SlotStatusMetaMap = Record<InterviewSlotStatus, SlotStatusMeta>;

/** 슬롯 선택/액션 처리에 사용하는 공용 시그니처 */
export interface SlotInteractionHandlers {
  onToggleSlotSelection: (slotId: number) => void;
  onClearSlotSelection: () => void;
  onOpenSlotDetail: (slot: InterviewSlotListItem) => void | Promise<void>;
}
