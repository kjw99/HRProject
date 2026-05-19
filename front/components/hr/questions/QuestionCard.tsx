"use client";

import { format, parseISO } from "date-fns";
import type { HrSavedQuestion } from "@/types/hr-questions";

export interface QuestionCardProps {
  question: HrSavedQuestion;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (questionId: number) => void;
}

export default function QuestionCard({
  question,
  selectable = false,
  selected = false,
  onToggleSelect,
}: QuestionCardProps) {
  let createdLabel = "—";
  try {
    createdLabel = format(parseISO(question.createdAt), "yyyy.MM.dd HH:mm");
  } catch {
    createdLabel = question.createdAt;
  }

  const handleToggle = () => {
    onToggleSelect?.(question.questionId);
  };

  const candidateName = question.candidateName?.trim();
  const candidateLabel =
    candidateName && candidateName.length > 0
      ? candidateName
      : question.candidateId != null
        ? `지원자 #${question.candidateId}`
        : null;

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition sm:p-5 ${
        selected
          ? "border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-500/25"
          : "border-slate-200/90 bg-white ring-1 ring-slate-900/[0.02] hover:border-slate-300"
      } ${selectable ? "cursor-pointer" : ""}`}
      aria-label={`질문 ${question.questionId}`}
      aria-pressed={selectable ? selected : undefined}
      onClick={selectable ? handleToggle : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle();
              }
            }
          : undefined
      }
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
    >
      <div className="flex gap-3">
        {selectable ? (
          <div className="flex shrink-0 items-start pt-0.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition ${
                selected
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-transparent"
              }`}
              aria-hidden
            >
              <i className="bx bx-check text-sm font-bold" />
            </span>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
              <i className="bx bx-purchase-tag" aria-hidden />
              {question.questionType}
            </span>
            {candidateLabel ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                <i className="bx bx-user" aria-hidden />
                {candidateLabel}
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
        </div>
      </div>
    </article>
  );
}
