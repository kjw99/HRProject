"use client";

import {
  RESUME_PARSE_STATUS_LABEL,
  RESUME_PARSE_STATUS_TONE,
} from "@/lib/hr/parsing.constants";
import type { ResumeParsingJobProgressProps } from "@/types/parsing-ui";

const TONE_CLASS = {
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  indigo: "border-indigo-200 bg-indigo-50/70 text-indigo-800",
  emerald: "border-emerald-200 bg-emerald-50/80 text-emerald-800",
  rose: "border-rose-200 bg-rose-50/80 text-rose-800",
} as const;

const BAR_CLASS = {
  slate: "bg-slate-400",
  indigo: "bg-indigo-600",
  emerald: "bg-emerald-600",
  rose: "bg-rose-500",
} as const;

export default function ResumeParsingJobProgress({
  progress,
  isVisible,
  isCancelling = false,
  onCancel,
}: ResumeParsingJobProgressProps) {
  if (!isVisible) return null;

  const tone = RESUME_PARSE_STATUS_TONE[progress.status] ?? "indigo";
  const label = RESUME_PARSE_STATUS_LABEL[progress.status] ?? progress.status;
  const isSpinning =
    progress.status === "running" || progress.status === "queued";
  const canCancel = Boolean(onCancel) && isSpinning;

  return (
    <section
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${TONE_CLASS[tone]}`}
      role="status"
      aria-live="polite"
      aria-busy={isSpinning}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm">
            <i
              className={`bx ${
                isSpinning ? "bx-loader-alt bx-spin" : "bx-time-five"
              } text-lg`}
            />
          </span>
          <div>
            <p className="text-sm font-black">백그라운드 파싱 진행 중</p>
            <p className="text-xs font-semibold opacity-80">
              {isCancelling ? "취소 요청을 처리하는 중…" : label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-black tabular-nums">
            {progress.processed}/{progress.total} · {progress.percent}%
          </p>
          {canCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isCancelling}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 sm:text-xs"
            >
              <i
                className={`bx ${
                  isCancelling
                    ? "bx-loader-alt animate-spin"
                    : "bx-stop-circle"
                } text-base`}
              />
              {isCancelling ? "취소 중" : "파싱 취소"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-white/70">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${BAR_CLASS[tone]}`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <p className="mt-2 text-[11px] font-semibold opacity-75">
        화면 우하단 토스트에서도 진행 상황을 확인할 수 있습니다. 다른 메뉴로
        이동해도 분석은 계속됩니다.
      </p>
    </section>
  );
}
