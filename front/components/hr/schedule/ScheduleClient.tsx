"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  addMonths,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { ScheduleCalendarPanel } from "@/components/hr/schedule/ScheduleCalendarPanel";
import { ScheduleFloatingRemote } from "@/components/hr/schedule/ScheduleFloatingRemote";
import { ScheduleHeader } from "@/components/hr/schedule/ScheduleHeader";
import { ScheduleListPanel } from "@/components/hr/schedule/ScheduleListPanel";
import {
  getMonthCalendarDays,
  getWeekCalendarDays,
  shiftWeekAnchor,
} from "@/components/hr/schedule/dateGridUtils";
import { getSlotStatusMeta } from "@/components/hr/schedule/scheduleMeta";
import type {
  ScheduleCalendarViewMode,
  ScheduleClientInitialData,
  ScheduleSlotFormMode,
  ScheduleSlotFormState,
} from "@/components/hr/schedule/types";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import { interviewSlotsApi } from "@/lib/hr/interview-slots.client";
import { showToastConfirm } from "@/lib/ui/show-toast-confirm";
import type {
  InterviewRoundWrite,
  InterviewSlotCreatePayload,
  InterviewSlotDetailItem,
  InterviewSlotListItem,
  InterviewSlotUpdatePayload,
} from "@/types/interviewSlotWrite";

const ScheduleOperationsModal = dynamic(
  () => import("@/components/hr/dashboard/ScheduleBookingModal"),
);
const ScheduleSlotDetailModal = dynamic(
  () => import("@/components/hr/schedule/ScheduleSlotDetailModal").then((mod) => mod.ScheduleSlotDetailModal),
);
const ScheduleSlotEditorPanel = dynamic(
  () => import("@/components/hr/schedule/ScheduleSlotEditorPanel").then((mod) => mod.ScheduleSlotEditorPanel),
);

type ScheduleClientProps = ScheduleClientInitialData;

const SCHEDULE_SLOTS_QUERY_KEY = "scheduleSlots";
const SCHEDULE_SLOT_DETAIL_QUERY_KEY = "scheduleSlotDetail";

const defaultForm = (date: Date): ScheduleSlotFormState => ({
  positionId: "",
  interviewRound: "1차",
  interviewerIds: [],
  interviewDate: format(date, "yyyy-MM-dd"),
  interviewStartTime: "10:00",
  interviewEndTime: "10:30",
  interviewLocation: "",
  capacity: "1",
});

const toLocalTime = (isoString: string) => format(parseISO(isoString), "HH:mm");
const toLocalDate = (isoString: string) => format(parseISO(isoString), "yyyy-MM-dd");

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    response?: { data?: { message?: string; detail?: string } };
  };
  return maybe.response?.data?.message || maybe.response?.data?.detail || fallback;
};

export default function ScheduleClient({
  initialSlots,
  initialPositions,
  initialApplicants,
  initialInterviewers,
  initialMonth,
}: ScheduleClientProps) {
  const queryClient = useQueryClient();

  const [monthCursor, setMonthCursor] = useState(() => parseISO(`${initialMonth}-01`));
  const [weekAnchor, setWeekAnchor] = useState(() => parseISO(`${initialMonth}-01`));
  const [viewMode, setViewMode] = useState<ScheduleCalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalSlot, setDetailModalSlot] = useState<InterviewSlotDetailItem | null>(null);
  const [isDetailModalLoading, setIsDetailModalLoading] = useState(false);
  const [formMode, setFormMode] = useState<ScheduleSlotFormMode>("create");
  const [form, setForm] = useState<ScheduleSlotFormState>(() => defaultForm(new Date()));
  const [slotEditorOpen, setSlotEditorOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [modalInterviewDateSeed, setModalInterviewDateSeed] = useState<string | undefined>(undefined);
  const [isRemoteMinimized, setIsRemoteMinimized] = useState(false);
  const [isDeletingSlots, setIsDeletingSlots] = useState(false);

  const makeSlotsQueryKey = useCallback(
    (targetMonth: Date) => [SCHEDULE_SLOTS_QUERY_KEY, targetMonth.getFullYear(), targetMonth.getMonth() + 1],
    [],
  );

  const activeMonth = viewMode === "month" ? monthCursor : startOfMonth(weekAnchor);
  const slotsQuery = useQuery({
    queryKey: makeSlotsQueryKey(activeMonth),
    queryFn: () =>
      interviewSlotsApi.fetchSlots({
        year: activeMonth.getFullYear(),
        month: activeMonth.getMonth() + 1,
      }),
    placeholderData: (prev) => prev,
    initialData: initialMonth === format(activeMonth, "yyyy-MM") ? initialSlots : undefined,
  });

  const slots = useMemo(() => slotsQuery.data ?? [], [slotsQuery.data]);

  const monthGridDays = useMemo(() => getMonthCalendarDays(monthCursor), [monthCursor]);
  const weekGridDays = useMemo(() => getWeekCalendarDays(weekAnchor), [weekAnchor]);
  const gridDays = viewMode === "month" ? monthGridDays : weekGridDays;
  const displayMonth = viewMode === "month" ? monthCursor : weekAnchor;

  const slotsByDate = useMemo(() => {
    return slots.reduce<Record<string, InterviewSlotListItem[]>>((acc, slot) => {
      const key = toLocalDate(slot.interviewStartsAt);
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const selectedDayKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDaySlots = useMemo(
    () =>
      [...(slotsByDate[selectedDayKey] ?? [])].sort(
        (a, b) => parseISO(a.interviewStartsAt).getTime() - parseISO(b.interviewStartsAt).getTime(),
      ),
    [selectedDayKey, slotsByDate],
  );

  const totalSlotCount = useMemo(() => {
    if (viewMode === "month") return slots.length;
    const weekKeys = new Set(weekGridDays.map((d) => format(d, "yyyy-MM-dd")));
    return slots.filter((slot) => weekKeys.has(toLocalDate(slot.interviewStartsAt))).length;
  }, [slots, viewMode, weekGridDays]);

  const selectedSlotId = selectedSlotIds.length === 1 ? selectedSlotIds[0] : null;

  const selectedSlotDetailQuery = useQuery({
    queryKey: [SCHEDULE_SLOT_DETAIL_QUERY_KEY, selectedSlotId],
    queryFn: () => interviewSlotsApi.fetchSlotDetail(selectedSlotId!),
    enabled: selectedSlotId != null,
    staleTime: 30_000,
  });

  const primarySlotDetail = selectedSlotDetailQuery.data ?? null;
  const isPrimaryDetailLoading = selectedSlotId != null && selectedSlotDetailQuery.isFetching;

  const fetchSlotDetailCached = useCallback(
    async (slotId: number) =>
      queryClient.fetchQuery({
        queryKey: [SCHEDULE_SLOT_DETAIL_QUERY_KEY, slotId],
        queryFn: () => interviewSlotsApi.fetchSlotDetail(slotId),
      }),
    [queryClient],
  );

  const filteredInterviewers = useMemo(() => {
    const positionId = Number(form.positionId);
    return initialInterviewers.filter((interviewer) => {
      const positionMatched = !positionId || interviewer.positionId === positionId;
      const roundMatched = interviewer.interviewRound === form.interviewRound;
      return positionMatched && roundMatched;
    });
  }, [form.interviewRound, form.positionId, initialInterviewers]);

  const calendarHeaderTitle = useMemo(() => {
    if (viewMode === "month") {
      return format(monthCursor, "yyyy년 M월", { locale: ko });
    }
    const start = weekGridDays[0];
    const end = weekGridDays[6];
    if (!start || !end) return "";
    return `${format(start, "M/d (EEE)", { locale: ko })} — ${format(end, "M/d (EEE)", { locale: ko })}`;
  }, [viewMode, monthCursor, weekGridDays]);

  const refreshSlots = useCallback(
    async (targetMonth = activeMonth) => {
      try {
        await queryClient.invalidateQueries({
          queryKey: [SCHEDULE_SLOTS_QUERY_KEY],
        });
        await queryClient.refetchQueries({
          queryKey: makeSlotsQueryKey(targetMonth),
          type: "active",
        });
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "면접 일정을 다시 불러오지 못했습니다."),
        );
      }
    },
    [activeMonth, makeSlotsQueryKey, queryClient],
  );

  const createSlotMutation = useMutation({
    mutationFn: (payload: InterviewSlotCreatePayload) =>
      interviewSlotsApi.createSlot(payload),
  });

  const updateSlotMutation = useMutation({
    mutationFn: ({
      slotId,
      payload,
    }: {
      slotId: number;
      payload: InterviewSlotUpdatePayload;
    }) => interviewSlotsApi.updateSlot(slotId, payload),
  });

  const isSaving =
    createSlotMutation.isPending ||
    updateSlotMutation.isPending ||
    isDeletingSlots;

  const handleViewModeChange = (mode: ScheduleCalendarViewMode) => {
    setViewMode(mode);
    if (mode === "week") {
      setWeekAnchor(selectedDate);
    }
  };

  const moveMonth = (direction: "prev" | "next") => {
    const nextMonth = direction === "prev" ? subMonths(monthCursor, 1) : addMonths(monthCursor, 1);
    setMonthCursor(nextMonth);
    setSelectedDate(startOfMonth(nextMonth));
    setWeekAnchor(startOfMonth(nextMonth));
    setSelectedSlotIds([]);
  };

  const moveWeek = (direction: "prev" | "next") => {
    const nextAnchor = shiftWeekAnchor(weekAnchor, direction);
    setWeekAnchor(nextAnchor);
    setSelectedDate((d) => shiftWeekAnchor(d, direction));
    setSelectedSlotIds([]);
  };

  const handleSelectCalendarDate = (day: Date) => {
    setSelectedDate(day);
    setWeekAnchor(day);
    setSelectedSlotIds([]);
    setIsRemoteMinimized(false);
    setForm((prev) => ({ ...prev, interviewDate: format(day, "yyyy-MM-dd") }));
    if (!isSameMonth(day, monthCursor)) {
      setMonthCursor(startOfMonth(day));
    }
  };

  const toggleSlotSelection = (slotId: number) => {
    setSelectedSlotIds((prev) => (prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]));
  };

  const clearSlotSelection = () => {
    setSelectedSlotIds([]);
  };

  const openSlotDetail = useCallback(
    async (slot: InterviewSlotListItem) => {
      setIsDetailModalLoading(true);
      try {
        const detail = await fetchSlotDetailCached(slot.slotId);
        setDetailModalSlot(detail);
        setDetailModalOpen(true);
      } catch (error) {
        toast.error(getErrorMessage(error, "면접 일정 상세를 불러오지 못했습니다."));
      } finally {
        setIsDetailModalLoading(false);
      }
    },
    [fetchSlotDetailCached],
  );

  const handleDetailSlotMutated = useCallback(
    async (slotId: number) => {
      await refreshSlots();
      try {
        const d = await fetchSlotDetailCached(slotId);
        setDetailModalSlot(d);
      } catch {
        // no-op
      }
    },
    [fetchSlotDetailCached, refreshSlots],
  );

  const inferPositionId = useCallback(
    (slot: InterviewSlotDetailItem) => {
      const matched = initialPositions.find((position) => position.positionName === slot.positionName);
      return matched ? String(matched.positionId) : "";
    },
    [initialPositions],
  );

  const inferInterviewerIds = useCallback(
    (slot: InterviewSlotDetailItem) =>
      initialInterviewers
        .filter((interviewer) => slot.interviewerNames.includes(interviewer.interviewerName))
        .map((interviewer) => interviewer.interviewerId),
    [initialInterviewers],
  );

  const applyDetailToEditForm = useCallback(
    (detail: InterviewSlotDetailItem) => {
      setFormMode("edit");
      setForm({
        positionId: inferPositionId(detail),
        interviewRound: detail.interviewRound as InterviewRoundWrite,
        interviewerIds: inferInterviewerIds(detail),
        interviewDate: toLocalDate(detail.interviewStartsAt),
        interviewStartTime: toLocalTime(detail.interviewStartsAt),
        interviewEndTime: toLocalTime(detail.interviewEndsAt),
        interviewLocation: detail.interviewLocation ?? "",
        capacity: String(detail.remainingCapacity + detail.bookedCandidateNames.length),
      });
    },
    [inferInterviewerIds, inferPositionId],
  );

  const startCreate = () => {
    setFormMode("create");
    setForm(defaultForm(selectedDate));
    setSlotEditorOpen(true);
  };

  const startEditForSelectedSlot = useCallback(async () => {
    if (selectedSlotIds.length !== 1) return;
    const slotId = selectedSlotIds[0];
    if (primarySlotDetail?.slotId === slotId) {
      applyDetailToEditForm(primarySlotDetail);
      setSlotEditorOpen(true);
      return;
    }
    try {
      const detail = await fetchSlotDetailCached(slotId);
      applyDetailToEditForm(detail);
      setSlotEditorOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "면접 일정 상세를 불러오지 못했습니다."));
    }
  }, [applyDetailToEditForm, fetchSlotDetailCached, primarySlotDetail, selectedSlotIds]);

  const openEditFromDetailModal = (detail: InterviewSlotDetailItem) => {
    setDetailModalOpen(false);
    setDetailModalSlot(null);
    setSelectedSlotIds([detail.slotId]);
    applyDetailToEditForm(detail);
    setSlotEditorOpen(true);
  };

  const updateForm = <K extends keyof ScheduleSlotFormState>(key: K, value: ScheduleSlotFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInterviewer = (interviewerId: number) => {
    setForm((prev) => ({
      ...prev,
      interviewerIds: prev.interviewerIds.includes(interviewerId)
        ? prev.interviewerIds.filter((id) => id !== interviewerId)
        : [...prev.interviewerIds, interviewerId],
    }));
  };

  const buildCreatePayload = (): InterviewSlotCreatePayload => ({
    positionId: Number(form.positionId),
    interviewRound: form.interviewRound,
    interviewerIds: form.interviewerIds,
    interviewDate: form.interviewDate,
    interviewStartTime: form.interviewStartTime,
    interviewEndTime: form.interviewEndTime,
    interviewLocation: form.interviewLocation.trim(),
    capacity: Number(form.capacity),
  });

  const buildUpdatePayload = (): InterviewSlotUpdatePayload => ({
    ...(form.positionId ? { positionId: Number(form.positionId) } : {}),
    interviewRound: form.interviewRound,
    interviewerIds: form.interviewerIds,
    interviewDate: form.interviewDate,
    interviewStartTime: form.interviewStartTime,
    interviewEndTime: form.interviewEndTime,
    interviewLocation: form.interviewLocation.trim(),
    capacity: Number(form.capacity),
  });

  const submitSlot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (formMode === "edit" && primarySlotDetail) {
        const slotId = primarySlotDetail.slotId;
        await updateSlotMutation.mutateAsync({
          slotId,
          payload: buildUpdatePayload(),
        });
        toast.success("면접 일정이 수정되었습니다.");
        const anchor = parseISO(`${form.interviewDate}T12:00:00`);
        const monthStart = startOfMonth(anchor);
        setMonthCursor(monthStart);
        setWeekAnchor(anchor);
        setSelectedDate(anchor);
        await refreshSlots(monthStart);
        await queryClient.invalidateQueries({ queryKey: [SCHEDULE_SLOT_DETAIL_QUERY_KEY, slotId], exact: true });
        setSelectedSlotIds([slotId]);
        setSlotEditorOpen(false);
      } else {
        await createSlotMutation.mutateAsync(buildCreatePayload());
        toast.success("면접 일정이 생성되었습니다.");
        await refreshSlots();
        setSelectedSlotIds([]);
        setSlotEditorOpen(false);
        setForm(defaultForm(selectedDate));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "면접 일정 저장 중 오류가 발생했습니다."));
    }
  };

  const deleteSelectedSlots = async () => {
    if (selectedSlotIds.length === 0 || isDeletingSlots) return;

    const idsToDelete = [...selectedSlotIds];

    const slotsWithActiveBookings = idsToDelete
      .map((id) => slots.find((s) => s.slotId === id))
      .filter(
        (s): s is InterviewSlotListItem =>
          !!s && s.bookedCandidateNames.length > 0,
      );

    if (slotsWithActiveBookings.length > 0) {
      const bookingHint =
        slotsWithActiveBookings.length === 1
          ? `예약: ${slotsWithActiveBookings[0].bookedCandidateNames.join(", ")}`
          : `${slotsWithActiveBookings.length}건에 지원자 예약이 있습니다`;

      toast.error("지원자 예약이 있는 일정은 삭제할 수 없습니다", {
        description: `면접관을 제거해도 삭제되지 않습니다. 일정 상세에서 예약을 먼저 취소한 뒤 다시 시도해 주세요. (${bookingHint})`,
        duration: 8000,
      });

      if (idsToDelete.length === 1) {
        void openSlotDetail(slotsWithActiveBookings[0]);
      }
      return;
    }

    const confirmed = await showToastConfirm({
      toastId: "schedule-delete-slots",
      title:
        idsToDelete.length > 1
          ? `선택한 ${idsToDelete.length}건을 삭제할까요?`
          : "면접 일정을 삭제할까요?",
      message:
        "지원자 예약이 없는 일정만 삭제됩니다. 면접관만 제거해도 예약이 남아 있으면 삭제되지 않습니다.",
      confirmLabel: "삭제",
      cancelLabel: "취소",
      tone: "danger",
    });
    if (!confirmed) return;

    setIsDeletingSlots(true);
    try {
      /**
       * 동일 useMutation 인스턴스에 mutateAsync 를 병렬 호출하면
       * TanStack Query 상태가 꼬여 일부 요청이 무시되거나 refresh 가 누락될 수 있다.
       * API 를 직접 호출하고 allSettled 로 건별 성공/실패를 처리한다.
       */
      const results = await Promise.allSettled(
        idsToDelete.map((slotId) => interviewSlotsApi.deleteSlot(slotId)),
      );

      const succeededIds: number[] = [];
      const failedMessages: string[] = [];

      results.forEach((result, index) => {
        const slotId = idsToDelete[index];
        if (result.status === "fulfilled") {
          succeededIds.push(slotId);
          return;
        }
        failedMessages.push(
          getApiErrorMessage(
            result.reason,
            `일정 #${slotId} 삭제에 실패했습니다.`,
          ),
        );
      });

      if (succeededIds.length > 0) {
        const succeededSet = new Set(succeededIds);

        queryClient.setQueriesData<InterviewSlotListItem[]>(
          { queryKey: [SCHEDULE_SLOTS_QUERY_KEY] },
          (old) => old?.filter((slot) => !succeededSet.has(slot.slotId)) ?? [],
        );

        for (const slotId of succeededIds) {
          queryClient.removeQueries({
            queryKey: [SCHEDULE_SLOT_DETAIL_QUERY_KEY, slotId],
            exact: true,
          });
        }

        setSelectedSlotIds((prev) => prev.filter((id) => !succeededSet.has(id)));
        setSlotEditorOpen(false);
        setFormMode("create");
        setForm(defaultForm(selectedDate));

        if (detailModalSlot && succeededSet.has(detailModalSlot.slotId)) {
          setDetailModalOpen(false);
          setDetailModalSlot(null);
        }

        await refreshSlots();

        toast.success(
          succeededIds.length > 1
            ? `${succeededIds.length}건의 면접 일정이 삭제되었습니다.`
            : "면접 일정이 삭제되었습니다.",
        );
      }

      if (failedMessages.length > 0) {
        const detail = failedMessages[0];
        toast.error(
          failedMessages.length > 1
            ? `${failedMessages.length}건 삭제에 실패했습니다. ${detail}`
            : detail,
        );
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "면접 일정 삭제 중 오류가 발생했습니다."),
      );
    } finally {
      setIsDeletingSlots(false);
    }
  };

  const openScheduleOperations = () => {
    setModalInterviewDateSeed(format(selectedDate, "yyyy-MM-dd"));
    setBookingModalOpen(true);
  };

  const jumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setWeekAnchor(today);
    setSelectedSlotIds([]);
    if (!isSameMonth(today, monthCursor)) {
      setMonthCursor(startOfMonth(today));
    }
  };

  const navPrev = () => {
    if (viewMode === "month") moveMonth("prev");
    else moveWeek("prev");
  };

  const navNext = () => {
    if (viewMode === "month") moveMonth("next");
    else moveWeek("next");
  };

  return (
    <>
      <div
        className={`min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 px-3 pt-5 sm:px-6 sm:pt-6 lg:px-8 ${
          isRemoteMinimized ? "pb-24 sm:pb-28" : "pb-40 sm:pb-44"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 lg:gap-6">
          <ScheduleHeader
            headerTitle={calendarHeaderTitle}
            viewMode={viewMode}
            totalSlotCount={totalSlotCount}
            selectedDayCount={selectedDaySlots.length}
            isLoading={slotsQuery.isFetching}
            onViewModeChange={handleViewModeChange}
            onNavigatePrev={navPrev}
            onNavigateNext={navNext}
            onJumpToday={jumpToToday}
          />

          <div className="grid grid-cols-1 gap-5 lg:h-[calc(100vh-200px)] lg:max-h-[920px] lg:min-h-[640px] lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)] lg:gap-6 lg:items-stretch">
            <div className="h-[min(78vh,760px)] min-h-[460px] lg:h-full lg:min-h-0">
              <ScheduleCalendarPanel
                viewMode={viewMode}
                gridDays={gridDays}
                displayMonth={displayMonth}
                selectedDate={selectedDate}
                onSelectDate={handleSelectCalendarDate}
                slotsByDate={slotsByDate}
              />
            </div>

            <div className="h-[min(76vh,720px)] min-h-[420px] lg:h-full lg:min-h-0">
              <ScheduleListPanel
                selectedDate={selectedDate}
                selectedDaySlots={selectedDaySlots}
                selectedSlotIds={selectedSlotIds}
                toLocalTime={toLocalTime}
                isDetailLoading={isDetailModalLoading || isPrimaryDetailLoading}
                onToggleSlotSelection={toggleSlotSelection}
                onClearSlotSelection={clearSlotSelection}
                onOpenSlotDetail={openSlotDetail}
                onStartCreate={openScheduleOperations}
              />
            </div>
          </div>
        </div>
      </div>

      <ScheduleFloatingRemote
        selectedDate={selectedDate}
        selectedSlotIds={selectedSlotIds}
        selectedDayCount={selectedDaySlots.length}
        isLoading={slotsQuery.isFetching}
        isSaving={isSaving}
        isMinimized={isRemoteMinimized}
        enableEscapeToMinimize={!slotEditorOpen && !detailModalOpen && !bookingModalOpen}
        onMinimize={() => setIsRemoteMinimized(true)}
        onRestore={() => setIsRemoteMinimized(false)}
        onOpenOperations={() => {
          setIsRemoteMinimized(false);
          openScheduleOperations();
        }}
        onEdit={() => void startEditForSelectedSlot()}
        onDelete={() => void deleteSelectedSlots()}
        onRefresh={() => void refreshSlots()}
        onNavigatePrev={navPrev}
        onNavigateNext={navNext}
      />

      <ScheduleSlotEditorPanel
        isOpen={slotEditorOpen}
        onClose={() => setSlotEditorOpen(false)}
        form={form}
        formMode={formMode}
        positions={initialPositions}
        filteredInterviewers={filteredInterviewers}
        isSaving={isSaving}
        onSubmit={submitSlot}
        onStartCreate={startCreate}
        onUpdateForm={updateForm}
        onToggleInterviewer={toggleInterviewer}
      />

      <ScheduleOperationsModal
        isOpen={bookingModalOpen}
        applicants={initialApplicants}
        initialMainTab="slots"
        initialInterviewDate={modalInterviewDateSeed}
        onClose={() => {
          setBookingModalOpen(false);
          setModalInterviewDateSeed(undefined);
          void refreshSlots();
        }}
      />

      <ScheduleSlotDetailModal
        isOpen={detailModalOpen}
        slot={detailModalSlot}
        onClose={() => {
          setDetailModalOpen(false);
          setDetailModalSlot(null);
        }}
        getStatusMeta={getSlotStatusMeta}
        onSlotMutated={handleDetailSlotMutated}
        onEditSlot={openEditFromDetailModal}
        onOpenInvitation={() => {
          setDetailModalOpen(false);
          setDetailModalSlot(null);
          openScheduleOperations();
        }}
      />
    </>
  );
}
