"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchHrQuestionsAll,
  fetchHrQuestionsByPosition,
} from "@/lib/hr/questions.client";
import type { HrDepartmentOption, HrSavedQuestion } from "@/types/hr-questions";
import DepartmentFilterColumn from "./DepartmentFilterColumn";
import QuestionInfiniteList from "./QuestionInfiniteList";

export interface HrQuestionsBrowseClientProps {
  initialDepartments: HrDepartmentOption[];
}

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    response?: { data?: { message?: string; detail?: string } };
  };
  return (
    maybe.response?.data?.message ||
    maybe.response?.data?.detail ||
    fallback
  );
};

export default function HrQuestionsBrowseClient({
  initialDepartments,
}: HrQuestionsBrowseClientProps) {
  const [filterText, setFilterText] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(
    null,
  );
  const [questions, setQuestions] = useState<HrSavedQuestion[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [questionCountByDepartmentId, setQuestionCountByDepartmentId] =
    useState<Record<number, number>>({});
  const [isLoadingQuestionCounts, setIsLoadingQuestionCounts] = useState(true);

  const selectedDepartmentName = useMemo(() => {
    if (selectedDepartmentId == null) return null;
    return (
      initialDepartments.find((d) => d.positionId === selectedDepartmentId)
        ?.positionName ?? null
    );
  }, [initialDepartments, selectedDepartmentId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingQuestionCounts(true);
      try {
        const all = await fetchHrQuestionsAll();
        if (cancelled) return;
        const next: Record<number, number> = {};
        for (const q of all) {
          if (q.positionId == null) continue;
          next[q.positionId] = (next[q.positionId] ?? 0) + 1;
        }
        setQuestionCountByDepartmentId(next);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setQuestionCountByDepartmentId({});
          toast.error(
            getErrorMessage(error, "부서별 질문 개수를 불러오지 못했습니다."),
          );
        }
      } finally {
        if (!cancelled) setIsLoadingQuestionCounts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedDepartmentId == null) {
      setQuestions([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoadingList(true);
      try {
        const data = await fetchHrQuestionsByPosition(selectedDepartmentId);
        if (!cancelled) {
          setQuestions(data);
          setQuestionCountByDepartmentId((prev) => ({
            ...prev,
            [selectedDepartmentId]: data.length,
          }));
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setQuestions([]);
          toast.error(
            getErrorMessage(error, "질문 목록을 불러오지 못했습니다."),
          );
        }
      } finally {
        if (!cancelled) setIsLoadingList(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDepartmentId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:gap-6">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-stretch lg:gap-6 xl:grid-cols-[minmax(280px,320px)_1fr]">
        <DepartmentFilterColumn
          departments={initialDepartments}
          filterText={filterText}
          onFilterTextChange={setFilterText}
          selectedDepartmentId={selectedDepartmentId}
          onSelectDepartment={setSelectedDepartmentId}
          questionCountByDepartmentId={questionCountByDepartmentId}
          isQuestionCountLoading={isLoadingQuestionCounts}
        />

        <section
          className="min-h-0 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-5 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto"
          aria-label="질문 목록"
        >
          <QuestionInfiniteList
            hasDepartmentSelection={selectedDepartmentId != null}
            selectedDepartmentName={selectedDepartmentName}
            items={questions}
            isLoading={isLoadingList}
          />
        </section>
      </div>
    </div>
  );
}
