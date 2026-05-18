"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useHrQuestionsBrowse } from "@/components/hr/questions/HrQuestionsBrowseProvider";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import { deleteHrQuestions, fetchHrQuestionsByPosition } from "@/lib/hr/questions.client";
import type { HrDepartmentOption } from "@/types/hr-questions";
import DepartmentFilterColumn from "./DepartmentFilterColumn";
import QuestionDeleteConfirmModal from "./QuestionDeleteConfirmModal";
import QuestionInfiniteList from "./QuestionInfiniteList";
import QuestionSelectionRemote from "./QuestionSelectionRemote";

export interface HrQuestionsBrowseClientProps {
  initialDepartments: HrDepartmentOption[];
}

export default function HrQuestionsBrowseClient({
  initialDepartments,
}: HrQuestionsBrowseClientProps) {
  const {
    questionCountByDepartmentId,
    isSyncingCounts,
    selectedDepartmentId,
    setSelectedDepartmentId,
    getQuestionsForDepartment,
    loadingDepartmentId,
    refreshCounts,
    invalidateDepartment,
    updateDepartmentQuestions,
  } = useHrQuestionsBrowse();

  const [filterText, setFilterText] = useState("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const questions =
    selectedDepartmentId != null
      ? getQuestionsForDepartment(selectedDepartmentId)
      : [];

  const isLoadingList =
    selectedDepartmentId != null &&
    loadingDepartmentId === selectedDepartmentId;

  const selectedDepartmentName = useMemo(() => {
    if (selectedDepartmentId == null) return null;
    return (
      initialDepartments.find((d) => d.positionId === selectedDepartmentId)
        ?.positionName ?? null
    );
  }, [initialDepartments, selectedDepartmentId]);

  const handleSelectDepartment = useCallback(
    (id: number | null) => {
      setSelectedDepartmentId(id);
      setSelectedQuestionIds([]);
    },
    [setSelectedDepartmentId],
  );

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
    if (selectedQuestionIds.length === 0 || selectedDepartmentId == null) return;
    setIsDeleting(true);
    try {
      await deleteHrQuestions(selectedQuestionIds);
      const deletedCount = selectedQuestionIds.length;
      const deptId = selectedDepartmentId;
      setSelectedQuestionIds([]);
      setDeleteConfirmOpen(false);

      invalidateDepartment(deptId);
      const data = await fetchHrQuestionsByPosition(deptId);
      updateDepartmentQuestions(deptId, data);
      await refreshCounts();

      toast.success(
        deletedCount === 1
          ? "질문이 삭제되었습니다."
          : `질문 ${deletedCount}개가 삭제되었습니다.`,
      );
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "질문 삭제에 실패했습니다."));
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
            onSelectDepartment={handleSelectDepartment}
            questionCountByDepartmentId={questionCountByDepartmentId}
            isQuestionCountLoading={
              isSyncingCounts &&
              Object.keys(questionCountByDepartmentId).length === 0
            }
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
