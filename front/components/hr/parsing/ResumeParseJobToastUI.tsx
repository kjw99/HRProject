"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RESUME_PARSE_STATUS_LABEL } from "@/lib/hr/parsing.constants";
import type { ResumeParseProgress } from "@/types/parsing-ui";

export const RESUME_PARSE_TOAST_ID = "resume-parse-job";

interface ResumeParseJobToastUIProps {
  toastId: string | number;
  progress: ResumeParseProgress;
  isMinimized: boolean;
  isCancelling: boolean;
  onToggleMinimize: () => void;
  onCancel: () => void;
}

export function ResumeParseJobToastUI({
  toastId,
  progress,
  isMinimized,
  isCancelling,
  onToggleMinimize,
  onCancel,
}: ResumeParseJobToastUIProps) {
  const router = useRouter();
  const label = RESUME_PARSE_STATUS_LABEL[progress.status] ?? progress.status;
  const isSpinning =
    progress.status === "running" || progress.status === "queued";

  const goToResults = () => {
    toast.dismiss(toastId);
    router.push("/hr/parsing");
  };

  if (isMinimized) {
    return (
      <div className="pointer-events-auto flex w-[min(100vw-2rem,340px)] items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-2 shadow-lg">
        <i
          className={`bx text-indigo-600 ${
            isSpinning ? "bx-loader-alt animate-spin" : "bx-bot"
          }`}
        />
        <span className="flex-1 truncate text-xs font-bold text-slate-700">
          이력서 파싱 {progress.processed}/{progress.total}
        </span>
        <button
          type="button"
          onClick={onCancel}
          disabled={isCancelling}
          className="rounded-full px-1.5 text-[11px] font-black text-rose-600 transition hover:text-rose-800 disabled:opacity-40"
          aria-label="파싱 취소"
          title="파싱 취소"
        >
          {isCancelling ? "취소 중…" : "취소"}
        </button>
        <button
          type="button"
          onClick={onToggleMinimize}
          className="text-xs font-black text-indigo-600 hover:text-indigo-800"
        >
          복원
        </button>
        <button
          type="button"
          onClick={() => toast.dismiss(toastId)}
          className="text-slate-400 hover:text-slate-600"
          aria-label="알림 닫기"
        >
          <i className="bx bx-x text-lg" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-auto w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white shadow-2xl shadow-indigo-200/40"
      role="status"
      aria-live="polite"
      aria-busy={isSpinning}
    >
      <div className="flex items-start gap-3 p-4 pr-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/50">
          <i
            className={`bx text-xl ${
              isSpinning ? "bx-loader-alt animate-spin" : "bx-bot"
            }`}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-500">
            Resume AI Parsing
          </p>
          <p className="mt-0.5 text-sm font-black text-slate-900">
            이력서 파싱 진행 중
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {isCancelling ? "취소 요청을 처리하는 중…" : label}
          </p>
          <p className="mt-1 text-xs font-bold tabular-nums text-indigo-700">
            {progress.processed}/{progress.total}개 · {progress.percent}%
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleMinimize}
            className="shrink-0 text-slate-300 transition hover:text-slate-500"
            aria-label="최소화"
          >
            <i className="bx bx-minus text-xl" />
          </button>
          <button
            type="button"
            onClick={() => toast.dismiss(toastId)}
            className="shrink-0 text-slate-300 transition hover:text-slate-500"
            aria-label="알림 닫기"
          >
            <i className="bx bx-x text-xl" />
          </button>
        </div>
      </div>

      <div className="mx-4 mb-3 h-2 overflow-hidden rounded-full bg-indigo-50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <p className="min-w-0 truncate text-[11px] font-semibold text-slate-500">
          다른 메뉴로 이동해도 분석은 계속됩니다.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCancelling}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-black text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
            aria-label="파싱 취소"
          >
            <i
              className={`bx text-base ${
                isCancelling ? "bx-loader-alt animate-spin" : "bx-stop-circle"
              }`}
            />
            {isCancelling ? "취소 중" : "취소"}
          </button>
          <button
            type="button"
            onClick={goToResults}
            className="text-[11px] font-black text-indigo-600 hover:text-indigo-800"
          >
            결과 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
