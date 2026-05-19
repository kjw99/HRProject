"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  mapParsingItemsToTableRows,
  recomputeDuplicateFlags,
} from "@/lib/hr/parsing-mapper";
import type { TableRowData } from "@/types/parsing";
import {
  RESUME_PARSE_TOAST_ID,
  ResumeParseJobToastUI,
} from "./ResumeParseJobToastUI";
import { coerceToErrorString, getApiErrorMessage } from "@/lib/hr/api-error";
import {
  cancelParseJob,
  createParseJob,
  getParseJob,
  summarizeParseErrors,
} from "@/lib/hr/parsing.client";
import {
  RESUME_PARSE_POLL_INTERVAL_MS,
} from "@/lib/hr/parsing.constants";
import type { ParseJobResponse, ParsingResponse } from "@/types/parsing";
import type { ResumeParseProgress } from "@/types/parsing-ui";

const JOB_QUERY_KEY = "resumeParseJob";

type SuccessListener = (result: ParsingResponse) => void;

function toProgress(job: ParseJobResponse | undefined): ResumeParseProgress {
  const total = job?.totalFiles ?? 0;
  const processed = job?.processedFiles ?? 0;
  const status = job?.status ?? "idle";
  const percent =
    total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
  return { processed, total, status, percent };
}

export interface ParseExcelPayload {
  base64: string;
  fileName: string;
}

export interface ResumeParseJobContextValue {
  startParse: (files: File[]) => Promise<void>;
  cancelParse: () => Promise<void>;
  resetJob: () => void;
  isCreating: boolean;
  isJobActive: boolean;
  isCancelling: boolean;
  progress: ResumeParseProgress;
  lastResult: ParsingResponse | null;
  jobError: string | null;
  parsedRows: TableRowData[];
  excelPayload: ParseExcelPayload | null;
  updateParsedRow: (
    rowId: string,
    updater: (row: TableRowData) => TableRowData,
  ) => void;
  removeParsedRow: (rowId: string) => void;
  goToParsingPage: () => void;
  registerOnSucceeded: (listener: SuccessListener) => () => void;
  consumePendingResult: () => ParsingResponse | null;
}

const ResumeParseJobContext = createContext<ResumeParseJobContextValue | null>(
  null,
);

function ResumeParseJobToastHost({
  isJobActive,
  progress,
  isMinimized,
  isCancelling,
  onToggleMinimize,
  onCancel,
}: {
  isJobActive: boolean;
  progress: ResumeParseProgress;
  isMinimized: boolean;
  isCancelling: boolean;
  onToggleMinimize: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!isJobActive) {
      toast.dismiss(RESUME_PARSE_TOAST_ID);
      return;
    }

    toast.custom(
      (t) => <ResumeParseJobToastUI
          toastId={t}
          progress={progress}
          isMinimized={isMinimized}
          isCancelling={isCancelling}
          onToggleMinimize={onToggleMinimize}
          onCancel={onCancel}
        />,
      {
        id: RESUME_PARSE_TOAST_ID,
        duration: Infinity,
        dismissible: true,
        position: "bottom-right",
      },
    );
  }, [
    isJobActive,
    progress.processed,
    progress.total,
    progress.percent,
    progress.status,
    isMinimized,
    isCancelling,
    onToggleMinimize,
    onCancel,
  ]);

  return null;
}

export function ResumeParseJobProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const listenersRef = useRef<Set<SuccessListener>>(new Set());
  const pendingResultRef = useRef<ParsingResponse | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [lastResult, setLastResult] = useState<ParsingResponse | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<TableRowData[]>([]);
  const [excelPayload, setExcelPayload] = useState<ParseExcelPayload | null>(
    null,
  );
  const [isToastMinimized, setIsToastMinimized] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const goToParsingPage = useCallback(() => {
    router.push("/hr/parsing");
  }, [router]);

  const registerOnSucceeded = useCallback((listener: SuccessListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const consumePendingResult = useCallback(() => {
    const pending = pendingResultRef.current;
    pendingResultRef.current = null;
    return pending;
  }, []);

  const applyParseResult = useCallback((result: ParsingResponse) => {
    setLastResult(result);
    const mapped = mapParsingItemsToTableRows(result.items);
    setParsedRows((prev) => recomputeDuplicateFlags([...mapped, ...prev]));

    if (result.excelBase64 && result.excelFileName) {
      setExcelPayload({
        base64: result.excelBase64,
        fileName: result.excelFileName,
      });
    }

    if (listenersRef.current.size > 0) {
      listenersRef.current.forEach((listener) => {
        try {
          listener(result);
        } catch {
          /* listener error ignored */
        }
      });
    } else {
      pendingResultRef.current = result;
    }
  }, []);

  const updateParsedRow = useCallback(
    (rowId: string, updater: (row: TableRowData) => TableRowData) => {
      setParsedRows((prev) =>
        recomputeDuplicateFlags(
          prev.map((row) => (row.id === rowId ? updater(row) : row)),
        ),
      );
    },
    [],
  );

  const removeParsedRow = useCallback((rowId: string) => {
    setParsedRows((prev) =>
      recomputeDuplicateFlags(prev.filter((row) => row.id !== rowId)),
    );
  }, []);

  const createMutation = useMutation({
    mutationFn: createParseJob,
    onSuccess: (data) => {
      setJobId(data.jobId);
      setPendingTotal(data.totalFiles);
      setJobError(null);
      setLastResult(null);
      setIsToastMinimized(false);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "파싱 작업을 시작하지 못했습니다."),
      );
    },
  });

  const jobQuery = useQuery({
    queryKey: [JOB_QUERY_KEY, jobId],
    queryFn: () => getParseJob(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "queued" || status === "running") {
        return RESUME_PARSE_POLL_INTERVAL_MS;
      }
      return false;
    },
  });

  useEffect(() => {
    if (jobQuery.isError) {
      const message = getApiErrorMessage(
        jobQuery.error,
        "파싱 작업 상태를 불러오지 못했습니다. 백엔드가 재시작되었으면 다시 업로드해 주세요.",
      );
      setJobError(message);
      toast.dismiss(RESUME_PARSE_TOAST_ID);
      toast.error(message, { position: "bottom-right" });
      setJobId(null);
      return;
    }

    const job = jobQuery.data;
    if (!job) return;

    if (job.status === "succeeded" && job.result) {
      const successCount = job.result.items.length;
      const errorCount = job.result.errors?.length ?? 0;

      applyParseResult(job.result);

      toast.dismiss(RESUME_PARSE_TOAST_ID);

      if (successCount === 0 && errorCount > 0) {
        const message = summarizeParseErrors(job.result.errors);
        setJobError(message);
        toast.error(message, {
          position: "bottom-right",
          duration: 8000,
        });
      } else if (errorCount > 0) {
        setJobError(null);
        toast.warning(
          `파싱 완료 · ${successCount}건 성공, ${errorCount}건 오류`,
          {
            position: "bottom-right",
            action: {
              label: "결과 보기",
              onClick: () => router.push("/hr/parsing"),
            },
          },
        );
      } else {
        setJobError(null);
        toast.success(
          `${successCount}건의 이력서 분석이 완료되었습니다.`,
          {
            position: "bottom-right",
            action: {
              label: "결과 보기",
              onClick: () => router.push("/hr/parsing"),
            },
          },
        );
      }

      setJobId(null);
      setIsToastMinimized(false);
      setIsCancelling(false);
      queryClient.removeQueries({ queryKey: [JOB_QUERY_KEY, job.jobId] });
    }

    if (job.status === "failed") {
      const message = coerceToErrorString(
        job.error,
        "이력서 파싱 작업이 실패했습니다.",
      );
      setJobError(message);
      toast.dismiss(RESUME_PARSE_TOAST_ID);
      toast.error(message, { position: "bottom-right" });
      setJobId(null);
      setIsToastMinimized(false);
      setIsCancelling(false);
      queryClient.removeQueries({ queryKey: [JOB_QUERY_KEY, job.jobId] });
    }

    if (job.status === "cancelled") {
      if (job.result) {
        applyParseResult(job.result);
      }
      const processedCount = job.processedFiles;
      const successCount = job.result?.items.length ?? 0;
      setJobError(null);
      toast.dismiss(RESUME_PARSE_TOAST_ID);

      const detail =
        successCount > 0
          ? `${processedCount}개 처리 · ${successCount}건 저장됨`
          : `${processedCount}개 처리됨`;
      toast.info(`이력서 파싱이 취소되었습니다. (${detail})`, {
        position: "bottom-right",
        duration: 5000,
      });
      setJobId(null);
      setIsToastMinimized(false);
      setIsCancelling(false);
      queryClient.removeQueries({ queryKey: [JOB_QUERY_KEY, job.jobId] });
    }
  }, [
    jobQuery.data,
    jobQuery.isError,
    jobQuery.error,
    applyParseResult,
    queryClient,
    router,
  ]);

  const progress = useMemo(() => {
    if (jobQuery.data) return toProgress(jobQuery.data);
    if (jobId || createMutation.isPending) {
      return {
        processed: 0,
        total: pendingTotal,
        status: "queued" as const,
        percent: 0,
      };
    }
    return toProgress(undefined);
  }, [jobQuery.data, jobId, createMutation.isPending, pendingTotal]);

  const isJobActive =
    createMutation.isPending ||
    (Boolean(jobId) &&
      (jobQuery.data?.status === "queued" ||
        jobQuery.data?.status === "running" ||
        jobQuery.isFetching));

  const startParse = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      await createMutation.mutateAsync(files);
    },
    [createMutation],
  );

  const cancelParse = useCallback(async () => {
    if (!jobId || isCancelling) return;
    setIsCancelling(true);
    try {
      const response = await cancelParseJob(jobId);
      if (response.cancelRequested) {
        toast.info(response.message, { position: "bottom-right" });
      } else {
        toast.message(response.message, { position: "bottom-right" });
        setIsCancelling(false);
      }
    } catch (error) {
      setIsCancelling(false);
      toast.error(
        getApiErrorMessage(error, "파싱 취소 요청 중 오류가 발생했습니다."),
      );
    }
  }, [jobId, isCancelling]);

  const resetJob = useCallback(() => {
    if (jobId) {
      queryClient.removeQueries({ queryKey: [JOB_QUERY_KEY, jobId] });
    }
    toast.dismiss(RESUME_PARSE_TOAST_ID);
    setJobId(null);
    setJobError(null);
    setIsCancelling(false);
    createMutation.reset();
  }, [createMutation, jobId, queryClient]);

  const value = useMemo<ResumeParseJobContextValue>(
    () => ({
      startParse,
      cancelParse,
      resetJob,
      isCreating: createMutation.isPending,
      isJobActive,
      isCancelling,
      progress,
      lastResult,
      jobError,
      parsedRows,
      excelPayload,
      updateParsedRow,
      removeParsedRow,
      goToParsingPage,
      registerOnSucceeded,
      consumePendingResult,
    }),
    [
      startParse,
      cancelParse,
      resetJob,
      createMutation.isPending,
      isJobActive,
      isCancelling,
      progress,
      lastResult,
      jobError,
      parsedRows,
      excelPayload,
      updateParsedRow,
      removeParsedRow,
      goToParsingPage,
      registerOnSucceeded,
      consumePendingResult,
    ],
  );

  return (
    <ResumeParseJobContext.Provider value={value}>
      <ResumeParseJobToastHost
        isJobActive={isJobActive}
        progress={progress}
        isMinimized={isToastMinimized}
        isCancelling={isCancelling}
        onToggleMinimize={() => setIsToastMinimized((prev) => !prev)}
        onCancel={() => void cancelParse()}
      />
      {children}
    </ResumeParseJobContext.Provider>
  );
}

export function useResumeParseJobContext(): ResumeParseJobContextValue {
  const ctx = useContext(ResumeParseJobContext);
  if (!ctx) {
    throw new Error(
      "useResumeParseJobContext must be used within ResumeParseJobProvider",
    );
  }
  return ctx;
}
