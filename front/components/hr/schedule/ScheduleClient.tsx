"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import ScheduleOperationsModal from "@/components/hr/dashboard/ScheduleBookingModal";
import { ScheduleCalendarPanel } from "@/components/hr/schedule/ScheduleCalendarPanel";
import { ScheduleFloatingRemote } from "@/components/hr/schedule/ScheduleFloatingRemote";
import { ScheduleHeader } from "@/components/hr/schedule/ScheduleHeader";
import { ScheduleListPanel } from "@/components/hr/schedule/ScheduleListPanel";
import { ScheduleSlotDetailModal } from "@/components/hr/schedule/ScheduleSlotDetailModal";
import { ScheduleSlotEditorPanel } from "@/components/hr/schedule/ScheduleSlotEditorPanel";
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
import { interviewSlotsApi } from "@/lib/hr/interview-slots.client";
import type {
  InterviewRoundWrite,
  InterviewSlotCreatePayload,
  InterviewSlotDetailItem,
  InterviewSlotListItem,
  InterviewSlotUpdatePayload,
} from "@/types/interviewSlotWrite";

type ScheduleClientProps = ScheduleClientInitialData;

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
const toLocalDate = (isoString: string) =>
  format(parseISO(isoString), "yyyy-MM-dd");

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    response?: { data?: { message?: string; detail?: string } };
  };
  return (
    maybe.response?.data?.message || maybe.response?.data?.detail || fallback
  );
};

export default function ScheduleClient({
  initialSlots,
  initialPositions,
  initialApplicants,
  initialInterviewers,
  initialMonth,
}: ScheduleClientProps) {
  const [monthCursor, setMonthCursor] = useState(() =>
    parseISO(`${initialMonth}-01`),
  );
  const [weekAnchor, setWeekAnchor] = useState(() =>
    parseISO(`${initialMonth}-01`),
  );
  const [viewMode, setViewMode] = useState<ScheduleCalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [slots, setSlots] = useState<InterviewSlotListItem[]>(initialSlots);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [primarySlotDetail, setPrimarySlotDetail] =
    useState<InterviewSlotDetailItem | null>(null);
  const [isPrimaryDetailLoading, setIsPrimaryDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalSlot, setDetailModalSlot] =
    useState<InterviewSlotDetailItem | null>(null);
  const [isDetailModalLoading, setIsDetailModalLoading] = useState(false);
  const [formMode, setFormMode] = useState<ScheduleSlotFormMode>("create");
  const [form, setForm] = useState<ScheduleSlotFormState>(() =>
    defaultForm(new Date()),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [slotEditorOpen, setSlotEditorOpen] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [modalInterviewDateSeed, setModalInterviewDateSeed] = useState<
    string | undefined
  >(undefined);
  const [isRemoteMinimized, setIsRemoteMinimized] = useState(false);

  const monthGridDays = useMemo(
    () => getMonthCalendarDays(monthCursor),
    [monthCursor],
  );
  const weekGridDays = useMemo(
    () => getWeekCalendarDays(weekAnchor),
    [weekAnchor],
  );
  const gridDays = viewMode === "month" ? monthGridDays : weekGridDays;
  const displayMonth = viewMode === "month" ? monthCursor : weekAnchor;

  const slotsByDate = useMemo(() => {
    return slots.reduce<Record<string, InterviewSlotListItem[]>>(
      (acc, slot) => {
        const key = toLocalDate(slot.interviewStartsAt);
        acc[key] = [...(acc[key] ?? []), slot];
        return acc;
      },
      {},
    );
  }, [slots]);

  const selectedDayKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDaySlots = useMemo(
    () =>
      [...(slotsByDate[selectedDayKey] ?? [])].sort(
        (a, b) =>
          parseISO(a.interviewStartsAt).getTime() -
          parseISO(b.interviewStartsAt).getTime(),
      ),
    [selectedDayKey, slotsByDate],
  );

  const totalSlotCount = useMemo(() => {
    if (viewMode === "month") return slots.length;
    const weekKeys = new Set(weekGridDays.map((d) => format(d, "yyyy-MM-dd")));
    return slots.filter((slot) =>
      weekKeys.has(toLocalDate(slot.interviewStartsAt)),
    ).length;
  }, [slots, viewMode, weekGridDays]);

  const selectedSlotId =
    selectedSlotIds.length === 1 ? selectedSlotIds[0] : null;

  useEffect(() => {
    if (selectedSlotId == null) {
      setPrimarySlotDetail(null);
      setIsPrimaryDetailLoading(false);
      return;
    }
    let ignore = false;
    setIsPrimaryDetailLoading(true);
    interviewSlotsApi
      .fetchSlotDetail(selectedSlotId)
      .then((detail) => {
        if (!ignore) setPrimarySlotDetail(detail);
      })
      .catch((error) => {
        if (!ignore) {
          toast.error(
            getErrorMessage(error, "면접 일정 상세를 불러오지 못했습니다."),
          );
          setPrimarySlotDetail(null);
        }
      })
      .finally(() => {
        if (!ignore) setIsPrimaryDetailLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedSlotId]);

  const filteredInterviewers = useMemo(() => {
    const positionId = Number(form.positionId);
    return initialInterviewers.filter((interviewer) => {
      const positionMatched =
        !positionId || interviewer.positionId === positionId;
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
    return `${format(start, "M/d (EEE)", { locale: ko })} — ${format(
      end,
      "M/d (EEE)",
      { locale: ko },
    )}`;
  }, [viewMode, monthCursor, weekGridDays]);

  const refreshSlots = useCallback(
    async (targetMonth = monthCursor) => {
      setIsLoading(true);
      try {
        const rows = await interviewSlotsApi.fetchSlots({
          year: targetMonth.getFullYear(),
          month: targetMonth.getMonth() + 1,
        });
        setSlots(rows);
      } catch (error) {
        toast.error(
          getErrorMessage(error, "면접 일정을 다시 불러오지 못했습니다."),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [monthCursor],
  );

  const handleViewModeChange = (mode: ScheduleCalendarViewMode) => {
    setViewMode(mode);
    if (mode === "week") {
      const anchor = selectedDate;
      setWeekAnchor(anchor);
      void refreshSlots(startOfMonth(anchor));
    } else {
      void refreshSlots(monthCursor);
    }
  };

  const moveMonth = async (direction: "prev" | "next") => {
    const nextMonth =
      direction === "prev"
        ? subMonths(monthCursor, 1)
        : addMonths(monthCursor, 1);
    setMonthCursor(nextMonth);
    setSelectedDate(startOfMonth(nextMonth));
    setWeekAnchor(startOfMonth(nextMonth));
    setSelectedSlotIds([]);
    await refreshSlots(nextMonth);
  };

  const moveWeek = async (direction: "prev" | "next") => {
    const nextAnchor = shiftWeekAnchor(weekAnchor, direction);
    setWeekAnchor(nextAnchor);
    setSelectedDate((d) => shiftWeekAnchor(d, direction));
    setSelectedSlotIds([]);
    await refreshSlots(startOfMonth(nextAnchor));
  };

  const handleSelectCalendarDate = (day: Date) => {
    setSelectedDate(day);
    setWeekAnchor(day);
    setSelectedSlotIds([]);
    setIsRemoteMinimized(false);
    setForm((prev) => ({
      ...prev,
      interviewDate: format(day, "yyyy-MM-dd"),
    }));
    if (!isSameMonth(day, monthCursor)) {
      const m = startOfMonth(day);
      setMonthCursor(m);
      void refreshSlots(m);
    }
  };

  const toggleSlotSelection = (slotId: number) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId],
    );
  };

  const clearSlotSelection = () => {
    setSelectedSlotIds([]);
  };

  const openSlotDetail = async (slot: InterviewSlotListItem) => {
    setIsDetailModalLoading(true);
    try {
      const detail = await interviewSlotsApi.fetchSlotDetail(slot.slotId);
      setDetailModalSlot(detail);
      setDetailModalOpen(true);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "면접 일정 상세를 불러오지 못했습니다."),
      );
    } finally {
      setIsDetailModalLoading(false);
    }
  };

  const handleDetailSlotMutated = async (slotId: number) => {
    await refreshSlots();
    try {
      const d = await interviewSlotsApi.fetchSlotDetail(slotId);
      setDetailModalSlot(d);
    } catch {
      /* 목록은 이미 갱신됨 */
    }
  };

  const inferPositionId = (slot: InterviewSlotDetailItem) => {
    const matched = initialPositions.find(
      (position) => position.positionName === slot.positionName,
    );
    return matched ? String(matched.positionId) : "";
  };

  const inferInterviewerIds = (slot: InterviewSlotDetailItem) =>
    initialInterviewers
      .filter((interviewer) =>
        slot.interviewerNames.includes(interviewer.interviewerName),
      )
      .map((interviewer) => interviewer.interviewerId);

  const applyDetailToEditForm = (detail: InterviewSlotDetailItem) => {
    setFormMode("edit");
    setForm({
      positionId: inferPositionId(detail),
      interviewRound: detail.interviewRound as InterviewRoundWrite,
      interviewerIds: inferInterviewerIds(detail),
      interviewDate: toLocalDate(detail.interviewStartsAt),
      interviewStartTime: toLocalTime(detail.interviewStartsAt),
      interviewEndTime: toLocalTime(detail.interviewEndsAt),
      interviewLocation: detail.interviewLocation ?? "",
      capacity: String(
        detail.remainingCapacity + detail.bookedCandidateNames.length,
      ),
    });
  };

  const startCreate = () => {
    setFormMode("create");
    setForm(defaultForm(selectedDate));
    setSlotEditorOpen(true);
  };

  const startEditForSelectedSlot = async () => {
    if (selectedSlotIds.length !== 1) return;
    const slotId = selectedSlotIds[0];
    if (primarySlotDetail?.slotId === slotId) {
      applyDetailToEditForm(primarySlotDetail);
      setSlotEditorOpen(true);
      return;
    }
    setIsPrimaryDetailLoading(true);
    try {
      const detail = await interviewSlotsApi.fetchSlotDetail(slotId);
      setPrimarySlotDetail(detail);
      applyDetailToEditForm(detail);
      setSlotEditorOpen(true);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "면접 일정 상세를 불러오지 못했습니다."),
      );
    } finally {
      setIsPrimaryDetailLoading(false);
    }
  };

  const openEditFromDetailModal = (detail: InterviewSlotDetailItem) => {
    setDetailModalOpen(false);
    setDetailModalSlot(null);
    setSelectedSlotIds([detail.slotId]);
    setPrimarySlotDetail(detail);
    applyDetailToEditForm(detail);
    setSlotEditorOpen(true);
  };

  const updateForm = <K extends keyof ScheduleSlotFormState>(
    key: K,
    value: ScheduleSlotFormState[K],
  ) => {
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
    setIsSaving(true);
    try {
      if (formMode === "edit" && primarySlotDetail) {
        const slotId = primarySlotDetail.slotId;
        await interviewSlotsApi.updateSlot(slotId, buildUpdatePayload());
        toast.success("면접 일정이 수정되었습니다.");
        const anchor = parseISO(`${form.interviewDate}T12:00:00`);
        const monthStart = startOfMonth(anchor);
        setMonthCursor(monthStart);
        setWeekAnchor(anchor);
        setSelectedDate(anchor);
        await refreshSlots(monthStart);
        const fresh = await interviewSlotsApi.fetchSlotDetail(slotId);
        setPrimarySlotDetail(fresh);
        setSelectedSlotIds([slotId]);
        setSlotEditorOpen(false);
      } else {
        await interviewSlotsApi.createSlot(buildCreatePayload());
        toast.success("면접 일정이 생성되었습니다.");
        await refreshSlots();
        setSelectedSlotIds([]);
        setSlotEditorOpen(false);
        setForm(defaultForm(selectedDate));
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "면접 일정 저장 중 오류가 발생했습니다."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSelectedSlots = async () => {
    if (selectedSlotIds.length === 0) return;
    setIsSaving(true);
    try {
      await Promise.all(
        selectedSlotIds.map((id) => interviewSlotsApi.deleteSlot(id)),
      );
      toast.success(
        selectedSlotIds.length > 1
          ? `${selectedSlotIds.length}건의 면접 일정이 삭제되었습니다.`
          : "면접 일정이 삭제되었습니다.",
      );
      setSelectedSlotIds([]);
      setSlotEditorOpen(false);
      setFormMode("create");
      setForm(defaultForm(selectedDate));
      await refreshSlots();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "면접 일정 삭제 중 오류가 발생했습니다."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openScheduleOperations = () => {
    setModalInterviewDateSeed(format(selectedDate, "yyyy-MM-dd"));
    setBookingModalOpen(true);
  };

  const jumpToToday = async () => {
    const today = new Date();
    setSelectedDate(today);
    setWeekAnchor(today);
    setSelectedSlotIds([]);
    if (!isSameMonth(today, monthCursor)) {
      const m = startOfMonth(today);
      setMonthCursor(m);
      await refreshSlots(m);
    }
  };

  const navPrev = () => {
    if (viewMode === "month") void moveMonth("prev");
    else void moveWeek("prev");
  };

  const navNext = () => {
    if (viewMode === "month") void moveMonth("next");
    else void moveWeek("next");
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
            isLoading={isLoading}
            onViewModeChange={handleViewModeChange}
            onNavigatePrev={navPrev}
            onNavigateNext={navNext}
            onJumpToday={() => void jumpToToday()}
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
        isLoading={isLoading}
        isSaving={isSaving}
        isMinimized={isRemoteMinimized}
        enableEscapeToMinimize={
          !slotEditorOpen && !detailModalOpen && !bookingModalOpen
        }
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
