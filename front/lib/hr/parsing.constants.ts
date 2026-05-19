import type { Accept } from "react-dropzone";
import type { ResumeParseJobStatusUi } from "@/types/parsing-ui";

export const RESUME_PARSE_MAX_FILES = 20;

export const RESUME_PARSE_ACCEPTED_FILES: Accept = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/x-hwp": [".hwp"],
  "text/plain": [".txt", ".md"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
};

export const RESUME_PARSE_POLL_INTERVAL_MS = 1500;

export const RESUME_PARSE_STATUS_LABEL: Record<ResumeParseJobStatusUi, string> = {
  idle: "대기",
  queued: "작업 대기열",
  running: "AI 분석 중",
  succeeded: "완료",
  failed: "실패",
  cancelled: "취소됨",
};

export const RESUME_PARSE_STATUS_TONE: Record<
  ResumeParseJobStatusUi,
  "slate" | "indigo" | "emerald" | "rose"
> = {
  idle: "slate",
  queued: "indigo",
  running: "indigo",
  succeeded: "emerald",
  failed: "rose",
  cancelled: "slate",
};

export const RESUME_PARSE_POSITION_ALL = "ALL";
