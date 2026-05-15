"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import type { InterviewSlotDetailItem, InterviewSlotListItem } from "@/types/interviewSlotWrite";

export interface SlotStatusMeta {
  label: string;
  className: string;
}

export interface ScheduleDayPanelProps {
  selectedDate: Date;
  selectedDaySlots: InterviewSlotListItem[];
  selectedSlotIds: number[];
  onToggleSlotSelection: (slotId: number) => void;
  onClearSlotSelection: () => void;
  primarySlotDetail: InterviewSlotDetailItem | null;
  isPrimaryDetailLoading: boolean;
  getStatusMeta: (status: string) => SlotStatusMeta;
  toLocalTime: (iso: string) => string;
  onStartEdit: () => void | Promise<void>;
  onDeleteSelected: () => void;
  onOpenSlotDetail: (slot: InterviewSlotListItem) => void | Promise<void>;
  onStartCreate: () => void;
  isSaving: boolean;
  isDetailModalLoading: boolean;
  isMinimized: boolean;
  onMinimize: () => void;
  onExpandFromFab: () => void;
  /** false이면 Esc로 최소화하지 않음(위에 다른 모달이 열려 있을 때) */
  enableEscapeToMinimize?: boolean;
}

export function ScheduleDayPanel({
  selectedDate,
  selectedDaySlots,
  selectedSlotIds,
  onToggleSlotSelection,
  onClearSlotSelection,
  primarySlotDetail,
  isPrimaryDetailLoading,
  getStatusMeta,
  toLocalTime,
  onStartEdit,
  onDeleteSelected,
  onOpenSlotDetail,
  onStartCreate,
  isSaving,
  isDetailModalLoading,
  isMinimized,
  onMinimize,
  onExpandFromFab,
  enableEscapeToMinimize = true,
}: ScheduleDayPanelProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isMinimized || !enableEscapeToMinimize) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onMinimize();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, isMinimized, enableEscapeToMinimize, onMinimize]);

  const selectedCount = selectedSlotIds.length;
  const multiSelect = selectedCount > 1;

  const fab = (
    <button
      type="button"
      onClick={onExpandFromFab}
      className="pointer-events-auto fixed bottom-4 right-4 z-40 flex min-w-18 flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-900 px-4 py-3 text-white shadow-xl ring-1 ring-black/10 transition hover:bg-slate-800 active:scale-[0.98]"
    >
      <span className="text-lg font-black leading-none">
        {format(selectedDate, "M/d", { locale: ko })}
      </span>
      <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
        Day
      </span>
      {selectedDaySlots.length > 0 ? (
        <span className="mt-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-black text-white">
          {selectedDaySlots.length}건
        </span>
      ) : null}
    </button>
  );

  const expandedPanel = (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={onMinimize}
      role="presentation"
    >
      <div
        className="pointer-events-auto flex max-h-[min(88vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Day
            </p>
            <h2 className="truncate text-base font-black text-slate-900 sm:text-lg">
              {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {selectedDaySlots.length}건
            </span>
            <button
              type="button"
              onClick={onMinimize}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
              title="최소화"
              aria-label="Day 패널 최소화"
            >
              <i className="bx bx-chevrons-down text-xl" />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3 sm:max-h-[min(52vh,440px)] sm:space-y-3 sm:p-4">
          {selectedDaySlots.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
              <i className="bx bx-calendar-x text-4xl opacity-60" />
              <p className="mt-2 text-sm font-bold">이 날짜에 배정된 면접이 없습니다.</p>
            </div>
          ) : (
            selectedDaySlots.map((slot) => {
              const status = getStatusMeta(slot.slotStatus);
              const checked = selectedSlotIds.includes(slot.slotId);
              return (
                <div
                  key={slot.slotId}
                  className={`flex w-full items-stretch gap-2 rounded-xl border p-2.5 transition sm:gap-3 sm:p-3 ${
                    checked
                      ? "border-slate-900 bg-slate-900 text-white shadow-md ring-1 ring-slate-900/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleSlotSelection(slot.slotId)}
                    className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-black ${checked ? "text-white" : "text-slate-900"}`}
                        >
                          {toLocalTime(slot.interviewStartsAt)} –{" "}
                          {toLocalTime(slot.interviewEndsAt)}
                        </p>
                        <p
                          className={`mt-0.5 text-xs font-bold ${checked ? "text-slate-300" : "text-slate-500"}`}
                        >
                          {slot.positionName ?? "직무 미지정"} · {slot.interviewRound}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ring-1 sm:text-[11px] ${
                          checked
                            ? "bg-white/10 text-white ring-white/20"
                            : status.className
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div
                      className={`mt-2 grid gap-1.5 text-[11px] font-bold sm:grid-cols-2 sm:text-xs ${
                        checked ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-1">
                        <i className="bx bx-map shrink-0" />
                        <span className="truncate">
                          {slot.interviewLocation || "장소 미정"}
                        </span>
                      </span>
                      <span className="flex min-w-0 items-center gap-1">
                        <i className="bx bx-user-voice shrink-0" />
                        <span className="truncate">
                          {slot.interviewerNames.length
                            ? slot.interviewerNames.join(", ")
                            : "면접관 미배정"}
                        </span>
                      </span>
                    </div>
                    {slot.bookedCandidateNames.length > 0 ? (
                      <p
                        className={`mt-1.5 truncate text-[11px] font-bold sm:text-xs ${
                          checked ? "text-indigo-200" : "text-indigo-600"
                        }`}
                      >
                        예약: {slot.bookedCandidateNames.join(", ")}
                      </p>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    disabled={isDetailModalLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      void onOpenSlotDetail(slot);
                    }}
                    className={`flex shrink-0 flex-col items-center justify-center gap-0.5 self-stretch rounded-lg px-2 py-1.5 text-[10px] font-black transition sm:px-2.5 sm:text-xs ${
                      checked
                        ? "bg-white/15 text-white hover:bg-white/25 disabled:opacity-40"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
                    }`}
                  >
                    <i className="bx bx-show-alt text-base sm:text-lg" />
                    자세히
                  </button>
                </div>
              );
            })
          )}
        </div>

        <AnimatePresence>
          {selectedCount > 0 ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="shrink-0 overflow-hidden border-t border-slate-200 bg-linear-to-t from-slate-900 to-slate-800 text-white"
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    선택된 일정
                  </p>
                  <p className="truncate text-sm font-black">
                    {multiSelect
                      ? `${selectedCount}건 선택됨`
                      : primarySlotDetail
                        ? `${primarySlotDetail.positionName ?? "직무 미지정"} · ${format(
                            parseISO(primarySlotDetail.interviewStartsAt),
                            "M/d HH:mm",
                            { locale: ko },
                          )}`
                        : isPrimaryDetailLoading
                          ? "불러오는 중…"
                          : "1건 선택됨"}
                  </p>
                </div>
                <div
                  className={`grid gap-2 ${multiSelect ? "grid-cols-2 sm:w-auto sm:min-w-[200px]" : "grid-cols-2 sm:grid-cols-4 sm:w-auto sm:min-w-[320px]"}`}
                >
                  {!multiSelect ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void onStartEdit()}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-white px-2 py-2 text-xs font-black text-slate-900 disabled:opacity-40 sm:px-3"
                      >
                        <i className="bx bx-edit" />
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const only = selectedDaySlots.find(
                            (s) => s.slotId === selectedSlotIds[0],
                          );
                          if (only) void onOpenSlotDetail(only);
                        }}
                        disabled={isSaving || isDetailModalLoading}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-500 px-2 py-2 text-xs font-black text-white disabled:opacity-40 sm:px-3"
                      >
                        <i className="bx bx-show-alt" />
                        자세히
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={onDeleteSelected}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-500 px-2 py-2 text-xs font-black text-white disabled:opacity-50 sm:px-3"
                  >
                    <i className="bx bx-trash" />
                    {multiSelect ? `삭제 (${selectedCount})` : "삭제"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearSlotSelection();
                      onStartCreate();
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-700 px-2 py-2 text-xs font-black text-white sm:px-3"
                  >
                    <i className="bx bx-x" />
                    선택 해제
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(isMinimized ? fab : expandedPanel, document.body);
}
