"use client";

import { format, parseISO } from "date-fns";
import type { HrSavedQuestion } from "@/types/hr-questions";

export interface QuestionCardProps {
  question: HrSavedQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  let createdLabel = "—";
  try {
    createdLabel = format(parseISO(question.createdAt), "yyyy.MM.dd HH:mm");
  } catch {
    createdLabel = question.createdAt;
  }

  return (
    <article
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.02] sm:p-5"
      aria-label={`질문 ${question.questionId}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
          <i className="bx bx-purchase-tag" aria-hidden />
          {question.questionType}
        </span>
        {question.candidateId != null ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            <i className="bx bx-user" aria-hidden />
            지원자 #{question.candidateId}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <i className="bx bx-briefcase" aria-hidden />
            직무 공통
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <i className="bx bx-time" aria-hidden />
          {createdLabel}
        </span>
      </div>
      <p className="text-[15px] font-bold leading-relaxed text-slate-900 sm:text-base">
        {question.questionText}
      </p>
      {question.evaluationIntent ? (
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
          <span className="font-black text-indigo-600">평가 의도</span>{" "}
          {question.evaluationIntent}
        </p>
      ) : null}
      {question.generationBasis ? (
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
          <span className="font-bold text-slate-600">근거</span>{" "}
          {question.generationBasis}
        </p>
      ) : null}
    </article>
  );
}
