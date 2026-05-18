"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const HR_QUESTIONS_SYNC_TOAST_ID = "hr-questions-sync";

export interface HrQuestionsSyncToastProgress {
  mode: "counts" | "department";
  label: string;
  percent: number;
  departmentName?: string | null;
}

interface HrQuestionsSyncToastUIProps {
  toastId: string | number;
  progress: HrQuestionsSyncToastProgress;
}

export function HrQuestionsSyncToastUI({
  toastId,
  progress,
}: HrQuestionsSyncToastUIProps) {
  const router = useRouter();

  const goToQuestions = () => {
    toast.dismiss(toastId);
    router.push("/hr/questions");
  };

  return (
    <div
      className="pointer-events-auto w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border-2 border-sky-100 bg-white shadow-2xl shadow-sky-200/40"
      role="status"
      aria-live="polite"
      aria-busy
    >
      <div className="flex items-start gap-3 p-4 pr-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-200/50">
          <i className="bx bx-loader-alt animate-spin text-xl" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
            HR Questions
          </p>
          <p className="mt-0.5 text-sm font-black text-slate-900">
            {progress.mode === "counts"
              ? "질문 데이터 동기화 중"
              : "부서 질문 불러오는 중"}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {progress.label}
          </p>
          {progress.departmentName ? (
            <p className="mt-1 text-xs font-bold text-sky-700">
              {progress.departmentName}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(toastId)}
          className="shrink-0 text-slate-300 transition hover:text-slate-500"
          aria-label="알림 닫기"
        >
          <i className="bx bx-x text-xl" />
        </button>
      </div>

      <div className="mx-4 mb-3 h-2 overflow-hidden rounded-full bg-sky-50">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <p className="text-[11px] font-semibold text-slate-500">
          다른 메뉴로 이동해도 불러오기는 계속됩니다
        </p>
        <button
          type="button"
          onClick={goToQuestions}
          className="shrink-0 text-[11px] font-black text-sky-600 hover:text-sky-800"
        >
          질문 조회 →
        </button>
      </div>
    </div>
  );
}
