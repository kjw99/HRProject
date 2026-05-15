"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  deleteHrQuestions,
  fetchHrQuestionsAll,
  fetchHrQuestionsByPosition,
} from "@/lib/hr/questions.client";
import type { HrDepartmentOption, HrSavedQuestion } from "@/types/hr-questions";
import DepartmentFilterColumn from "./DepartmentFilterColumn";
import QuestionDeleteConfirmModal from "./QuestionDeleteConfirmModal";
import QuestionInfiniteList from "./QuestionInfiniteList";
import QuestionSelectionRemote from "./QuestionSelectionRemote";

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

async function buildQuestionCountMap(): Promise<Record<number, number>> {
  const all = await fetchHrQuestionsAll();
  const next: Record<number, number> = {};
  for (const q of all) {
    if (q.positionId == null) continue;
    next[q.positionId] = (next[q.positionId] ?? 0) + 1;
  }
  return next;
}

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
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const selectedDepartmentName = useMemo(() => {
    if (selectedDepartmentId == null) return null;
    return (
      initialDepartments.find((d) => d.positionId === selectedDepartmentId)
        ?.positionName ?? null
    );
  }, [initialDepartments, selectedDepartmentId]);

  const refreshQuestionCounts = useCallback(async () => {
    try {
      setQuestionCountByDepartmentId(await buildQuestionCountMap());
    } catch (error) {
      console.error(error);
      toast.error(
        getErrorMessage(error, "부서별 질문 개수를 불러오지 못했습니다."),
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingQuestionCounts(true);
      try {
        const next = await buildQuestionCountMap();
        if (!cancelled) setQuestionCountByDepartmentId(next);
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
    setSelectedQuestionIds([]);
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

  const toggleQuestion = (questionId: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  const clearSelection = () => setSelectedQuestionIds([]);

  const toggleSelectAll = () => {
    const allSelected =
      questions.length > 0 &&
      questions.every((q) => selectedQuestionIds.includes(q.questionId));
    if (allSelected) {
      setSelectedQuestionIds([]);
      return;
    }
    setSelectedQuestionIds(questions.map((q) => q.questionId));
  };

  const handleConfirmDelete = async () => {
    if (selectedQuestionIds.length === 0) return;
    setIsDeleting(true);
    try {
      await deleteHrQuestions(selectedQuestionIds);
      const deletedCount = selectedQuestionIds.length;
      const deptId = selectedDepartmentId;
      setSelectedQuestionIds([]);
      setDeleteConfirmOpen(false);

      if (deptId != null) {
        const data = await fetchHrQuestionsByPosition(deptId);
        setQuestions(data);
        setQuestionCountByDepartmentId((prev) => ({
          ...prev,
          [deptId]: data.length,
        }));
      }
      await refreshQuestionCounts();

      toast.success(
        deletedCount === 1
          ? "질문이 삭제되었습니다."
          : `질문 ${deletedCount}개가 삭제되었습니다.`,
      );
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "질문 삭제에 실패했습니다."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
              selectedQuestionIds={selectedQuestionIds}
              onToggleQuestion={toggleQuestion}
              onToggleSelectAll={toggleSelectAll}
              hasSelectionBar={selectedQuestionIds.length > 0}
            />
          </section>
        </div>
      </div>

      <QuestionSelectionRemote
        selectedCount={selectedQuestionIds.length}
        isDeleting={isDeleting}
        onClearSelection={clearSelection}
        onRequestDelete={() => setDeleteConfirmOpen(true)}
      />

      <QuestionDeleteConfirmModal
        isOpen={deleteConfirmOpen}
        count={selectedQuestionIds.length}
        onClose={() => {
          if (!isDeleting) setDeleteConfirmOpen(false);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
