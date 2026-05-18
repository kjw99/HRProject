"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  HR_QUESTIONS_SYNC_TOAST_ID,
  HrQuestionsSyncToastUI,
  type HrQuestionsSyncToastProgress,
} from "./HrQuestionsSyncToastUI";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import {
  fetchHrQuestionsAll,
  fetchHrQuestionsByPosition,
} from "@/lib/hr/questions.client";
import type { HrSavedQuestion } from "@/types/hr-questions";

const COUNTS_QUERY_KEY = ["hr-questions-counts"] as const;
const departmentQueryKey = (positionId: number) =>
  ["hr-questions-by-position", positionId] as const;

async function buildQuestionCountMap(): Promise<Record<number, number>> {
  const all = await fetchHrQuestionsAll();
  const next: Record<number, number> = {};
  for (const q of all) {
    if (q.positionId == null) continue;
    next[q.positionId] = (next[q.positionId] ?? 0) + 1;
  }
  return next;
}

export interface HrQuestionsBrowseContextValue {
  questionCountByDepartmentId: Record<number, number>;
  isSyncingCounts: boolean;
  questionsByDepartmentId: Record<number, HrSavedQuestion[]>;
  loadingDepartmentId: number | null;
  selectedDepartmentId: number | null;
  setSelectedDepartmentId: (id: number | null) => void;
  getQuestionsForDepartment: (positionId: number) => HrSavedQuestion[];
  refreshCounts: () => Promise<void>;
  invalidateDepartment: (positionId: number) => void;
  updateDepartmentQuestions: (
    positionId: number,
    questions: HrSavedQuestion[],
  ) => void;
}

const HrQuestionsBrowseContext =
  createContext<HrQuestionsBrowseContextValue | null>(null);

function HrQuestionsSyncToastHost({
  isVisible,
  progress,
}: {
  isVisible: boolean;
  progress: HrQuestionsSyncToastProgress;
}) {
  useEffect(() => {
    if (!isVisible) {
      toast.dismiss(HR_QUESTIONS_SYNC_TOAST_ID);
      return;
    }

    toast.custom(
      (t) => <HrQuestionsSyncToastUI toastId={t} progress={progress} />,
      {
        id: HR_QUESTIONS_SYNC_TOAST_ID,
        duration: Infinity,
        dismissible: true,
        position: "bottom-right",
      },
    );
  }, [
    isVisible,
    progress.mode,
    progress.label,
    progress.percent,
    progress.departmentName,
  ]);

  return null;
}

export function HrQuestionsBrowseProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [questionsCache, setQuestionsCache] = useState<
    Record<number, HrSavedQuestion[]>
  >({});
  const countsQuery = useQuery({
    queryKey: COUNTS_QUERY_KEY,
    queryFn: buildQuestionCountMap,
    staleTime: 60_000,
  });

  const questionCountByDepartmentId = countsQuery.data ?? {};

  const departmentQuery = useQuery({
    queryKey: departmentQueryKey(selectedDepartmentId ?? 0),
    queryFn: () => fetchHrQuestionsByPosition(selectedDepartmentId!),
    enabled: selectedDepartmentId != null,
    staleTime: 60_000,
  });

  const loadingDepartmentId =
    selectedDepartmentId != null && departmentQuery.isFetching
      ? selectedDepartmentId
      : null;

  useEffect(() => {
    if (selectedDepartmentId == null || !departmentQuery.data) return;
    setQuestionsCache((prev) => ({
      ...prev,
      [selectedDepartmentId]: departmentQuery.data,
    }));
  }, [departmentQuery.data, selectedDepartmentId]);

  const refreshCounts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: COUNTS_QUERY_KEY });
    await countsQuery.refetch();
  }, [countsQuery, queryClient]);

  const invalidateDepartment = useCallback(
    (positionId: number) => {
      void queryClient.invalidateQueries({
        queryKey: departmentQueryKey(positionId),
      });
      setQuestionsCache((prev) => {
        const next = { ...prev };
        delete next[positionId];
        return next;
      });
    },
    [queryClient],
  );

  const updateDepartmentQuestions = useCallback(
    (positionId: number, questions: HrSavedQuestion[]) => {
      setQuestionsCache((prev) => ({ ...prev, [positionId]: questions }));
      queryClient.setQueryData(departmentQueryKey(positionId), questions);
      queryClient.setQueryData<Record<number, number>>(
        COUNTS_QUERY_KEY,
        (prev) => ({
          ...(prev ?? {}),
          [positionId]: questions.length,
        }),
      );
    },
    [queryClient],
  );

  const getQuestionsForDepartment = useCallback(
    (positionId: number) => {
      if (positionId === selectedDepartmentId && departmentQuery.data) {
        return departmentQuery.data;
      }
      return (
        queryClient.getQueryData<HrSavedQuestion[]>(
          departmentQueryKey(positionId),
        ) ?? questionsCache[positionId] ?? []
      );
    },
    [
      selectedDepartmentId,
      departmentQuery.data,
      queryClient,
      questionsCache,
    ],
  );

  useEffect(() => {
    if (departmentQuery.isError) {
      toast.error(
        getApiErrorMessage(
          departmentQuery.error,
          "질문 목록을 불러오지 못했습니다.",
        ),
      );
    }
  }, [departmentQuery.isError, departmentQuery.error]);

  const isSyncingCounts =
    countsQuery.isFetching && countsQuery.fetchStatus === "fetching";

  const syncToastProgress = useMemo<HrQuestionsSyncToastProgress>(() => {
    if (loadingDepartmentId != null) {
      return {
        mode: "department",
        label: "선택한 부서의 질문을 가져오고 있습니다",
        percent: 70,
      };
    }
    return {
      mode: "counts",
      label: "부서별 질문 개수를 집계하고 있습니다",
      percent: 45,
    };
  }, [loadingDepartmentId]);

  const showSyncToast = isSyncingCounts || loadingDepartmentId != null;

  const value = useMemo<HrQuestionsBrowseContextValue>(
    () => ({
      questionCountByDepartmentId,
      isSyncingCounts,
      questionsByDepartmentId: questionsCache,
      loadingDepartmentId,
      selectedDepartmentId,
      setSelectedDepartmentId,
      getQuestionsForDepartment,
      refreshCounts,
      invalidateDepartment,
      updateDepartmentQuestions,
    }),
    [
      questionCountByDepartmentId,
      isSyncingCounts,
      questionsCache,
      loadingDepartmentId,
      selectedDepartmentId,
      getQuestionsForDepartment,
      refreshCounts,
      invalidateDepartment,
      updateDepartmentQuestions,
    ],
  );

  return (
    <HrQuestionsBrowseContext.Provider value={value}>
      <HrQuestionsSyncToastHost
        isVisible={showSyncToast}
        progress={syncToastProgress}
      />
      {children}
    </HrQuestionsBrowseContext.Provider>
  );
}

export function useHrQuestionsBrowse(): HrQuestionsBrowseContextValue {
  const ctx = useContext(HrQuestionsBrowseContext);
  if (!ctx) {
    throw new Error(
      "useHrQuestionsBrowse must be used within HrQuestionsBrowseProvider",
    );
  }
  return ctx;
}
