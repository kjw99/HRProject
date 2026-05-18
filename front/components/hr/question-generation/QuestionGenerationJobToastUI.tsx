"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { questionGenerationPercent } from "@/lib/hr/question-generation.constants";

export interface QuestionGenerationToastProgress {
  status: string;
  label: string;
  percent: number;
  resultCount?: number;
}

interface QuestionGenerationJobToastUIProps {
  toastId: string | number;
  progress: QuestionGenerationToastProgress;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function QuestionGenerationJobToastUI({
  toastId,
  progress,
  isMinimized,
  onToggleMinimize,
}: QuestionGenerationJobToastUIProps) {
  const router = useRouter();
  const isSpinning =
    progress.status === "running" || progress.status === "queued";

  const goToAgent = () => {
    toast.dismiss(toastId);
    router.push("/hr/ai-gen");
  };

  if (isMinimized) {
    return (
      <div className="pointer-events-auto flex w-[min(100vw-2rem,320px)] items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-2 shadow-lg">
        <i
          className={`bx text-violet-600 ${
            isSpinning ? "bx-loader-alt animate-spin" : "bx-brain"
          }`}
        />
        <span className="flex-1 truncate text-xs font-bold text-slate-700">
          질문 생성 {progress.percent}%
        </span>
        <button
          type="button"
          onClick={onToggleMinimize}
          className="text-xs font-black text-violet-600 hover:text-violet-800"
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
      className="pointer-events-auto w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border-2 border-violet-100 bg-white shadow-2xl shadow-violet-200/40"
      role="status"
      aria-live="polite"
      aria-busy={isSpinning}
    >
      <div className="flex items-start gap-3 p-4 pr-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200/50">
          <i
            className={`bx text-xl ${
              isSpinning ? "bx-loader-alt animate-spin" : "bx-brain"
            }`}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">
            Interview AI Agent
          </p>
          <p className="mt-0.5 text-sm font-black text-slate-900">
            면접 질문 생성 진행 중
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {progress.label}
          </p>
          {progress.resultCount != null && progress.resultCount > 0 ? (
            <p className="mt-1 text-xs font-bold text-violet-700">
              생성된 질문 {progress.resultCount}개
            </p>
          ) : null}
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

      <div className="mx-4 mb-3 h-2 overflow-hidden rounded-full bg-violet-50">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500 ease-out ${
            isSpinning ? "animate-pulse" : ""
          }`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <p className="text-[11px] font-semibold text-slate-500">
          다른 메뉴로 이동해도 생성은 계속됩니다.
        </p>
        <button
          type="button"
          onClick={goToAgent}
          className="shrink-0 text-[11px] font-black text-violet-600 hover:text-violet-800"
        >
          에이전트 보기 →
        </button>
      </div>
    </div>
  );
}
