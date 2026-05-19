import type { HTMLAttributes, InputHTMLAttributes } from "react";
import type {
  ParsingItem,
  ParsingResponse,
  ResumeParseJobStatus,
  TableRowData,
} from "./parsing";

export type { ResumeParseJobStatus };

export type ResumeParseJobStatusUi = ResumeParseJobStatus | "idle";

export interface ResumeParseJobSnapshot {
  jobId: string;
  status: ResumeParseJobStatusUi;
  totalFiles: number;
  processedFiles: number;
  error: string | null;
  result: ParsingResponse | null;
}

export interface ResumeParseProgress {
  processed: number;
  total: number;
  status: ResumeParseJobStatusUi;
  percent: number;
}

export interface ResumeParsingUploadZoneProps {
  files: File[];
  isDragActive: boolean;
  isDisabled: boolean;
  maxFiles: number;
  getRootProps: () => HTMLAttributes<HTMLElement>;
  getInputProps: () => InputHTMLAttributes<HTMLInputElement>;
  onRemoveFile: (index: number) => void;
  onStartParsing: () => void;
  isStarting: boolean;
}

export interface ResumeParsingJobProgressProps {
  progress: ResumeParseProgress;
  isVisible: boolean;
  isCancelling?: boolean;
  onCancel?: () => void;
}

export interface ResumeParsingResultsSectionProps {
  rows: TableRowData[];
  positionOptions: string[];
  filterPosition: string;
  globalSearch: string;
  onFilterPositionChange: (position: string) => void;
  onGlobalSearchChange: (value: string) => void;
  onViewDetail: (row: TableRowData) => void;
  onDeleteRow: (row: TableRowData) => void;
  onDownloadExcel?: () => void;
  excelFileName?: string | null;
  hasExcel: boolean;
}

export interface ResumeParsingClientProps {
  /** SSR 확장용 (현재는 클라이언트 전용) */
  initialRows?: TableRowData[];
}

export type { ParsingItem, ParsingResponse, TableRowData };
