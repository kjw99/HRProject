"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HrSavedQuestion } from "@/types/hr-questions";
import QuestionCard from "./QuestionCard";

const PAGE_SIZE = 12;

export interface QuestionInfiniteListProps {
  /** 부서를 아직 고르지 않은 초기 상태 */
  hasDepartmentSelection: boolean;
  selectedDepartmentName: string | null;
  items: HrSavedQuestion[];
  isLoading: boolean;
  selectedQuestionIds: number[];
  onToggleQuestion: (questionId: number) => void;
  onToggleSelectAll: () => void;
  hasSelectionBar: boolean;
}

export default function QuestionInfiniteList({
  hasDepartmentSelection,
  selectedDepartmentName,
  items,
  isLoading,
  selectedQuestionIds,
  onToggleQuestion,
  onToggleSelectAll,
  hasSelectionBar,
}: QuestionInfiniteListProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(PAGE_SIZE, items.length));
  }, [items]);

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const someSelected = selectedQuestionIds.length > 0;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, items.length));
  }, [items.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasDepartmentSelection || isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "120px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasDepartmentSelection, isLoading, hasMore, loadMore, visibleCount]);

  if (!hasDepartmentSelection) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center sm:min-h-[400px]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-slate-200/80">
          <i className="bx bx-mouse text-3xl text-slate-300" aria-hidden />
        </div>
        <h3 className="text-lg font-black text-slate-800">부서를 선택해 주세요</h3>
        <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
          부서 목록에서 항목을 고르면 저장된 면접 질문이 이 영역에 표시됩니다.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="질문 불러오는 중">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl bg-slate-100/90 ring-1 ring-slate-200/60"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
        <i className="bx bx-message-rounded-x mb-3 text-4xl text-slate-300" />
        <h3 className="text-base font-black text-slate-800">
          등록된 질문이 없습니다
        </h3>
        <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
          <span className="font-bold text-indigo-600">{selectedDepartmentName}</span>
          부서에 저장된 질문이 아직 없습니다. AI 질문 생성에서 추가해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-0 space-y-4 ${hasSelectionBar ? "pb-24" : ""}`}>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            선택 부서
          </p>
          <p className="text-lg font-black text-slate-900">{selectedDepartmentName}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="text-xs font-bold text-indigo-600 transition hover:text-indigo-800"
          >
            {items.length > 0 &&
            items.every((q) => selectedQuestionIds.includes(q.questionId))
              ? "전체 해제"
              : "전체 선택"}
          </button>
          <p className="text-sm font-bold text-slate-500">
            총 <span className="tabular-nums text-indigo-600">{items.length}</span>건
            {someSelected ? (
              <span className="ml-2 text-indigo-600">
                · {selectedQuestionIds.length}개 선택
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {visible.map((q) => (
          <QuestionCard
            key={q.questionId}
            question={q}
            selectable
            selected={selectedQuestionIds.includes(q.questionId)}
            onToggleSelect={onToggleQuestion}
          />
        ))}
      </div>

      {hasMore ? (
        <div
          ref={sentinelRef}
          className="flex h-14 items-center justify-center text-xs font-semibold text-slate-400"
          aria-hidden
        >
          <i className="bx bx-loader-alt animate-spin text-lg" />
        </div>
      ) : (
        <p className="pb-4 pt-2 text-center text-[11px] font-semibold text-slate-400">
          모든 질문을 불러왔습니다
        </p>
      )}
    </div>
  );
}
