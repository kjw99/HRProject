"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useIncrementalList } from "@/hooks/useIncrementalList";
import { getSlotStatusMeta } from "./scheduleMeta";
import type { InterviewSlotListItem } from "@/types/interviewSlotWrite";
import type { SlotInteractionHandlers } from "./types";

export interface ScheduleListPanelProps extends SlotInteractionHandlers {
  selectedDate: Date;
  selectedDaySlots: InterviewSlotListItem[];
  selectedSlotIds: number[];
  toLocalTime: (iso: string) => string;
  isDetailLoading: boolean;
  onStartCreate: () => void;
  /** 1회 추가 로드 단위 (기본 10) */
  pageSize?: number;
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
} as const;

export function ScheduleListPanel({
  selectedDate,
  selectedDaySlots,
  selectedSlotIds,
  toLocalTime,
  isDetailLoading,
  onToggleSlotSelection,
  onClearSlotSelection,
  onOpenSlotDetail,
  onStartCreate,
  pageSize = 10,
}: ScheduleListPanelProps) {
  const selectedCount = selectedSlotIds.length;
  const titleDate = format(selectedDate, "M월 d일 (EEE)", { locale: ko });
  const resetKey = format(selectedDate, "yyyy-MM-dd");
  const isEmpty = selectedDaySlots.length === 0;

  const { visible, total, visibleCount, hasMore, loadMore } = useIncrementalList(
    selectedDaySlots,
    { pageSize, resetKey },
  );

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [resetKey]);

  useEffect(() => {
    if (!hasMore) return;
    const target = sentinelRef.current;
    const root = scrollAreaRef.current;
    if (!target || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { root, rootMargin: "160px 0px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore, visibleCount]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),_0_8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur"
      aria-label="선택 일자 일정 리스트"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Day · Slots
          </p>
          <h2 className="mt-0.5 truncate text-base font-black text-slate-900 sm:text-lg">
            {titleDate}
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs font-bold text-slate-500">
            <span>
              총 <span className="text-slate-900">{total}</span>건
            </span>
            <span className="text-slate-300">·</span>
            <span>
              표시 <span className="text-slate-900">{visibleCount}</span>
            </span>
            {selectedCount > 0 ? (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-indigo-600">선택 {selectedCount}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {selectedCount > 0 ? (
            <button
              type="button"
              onClick={onClearSlotSelection}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-600 transition hover:bg-slate-50"
            >
              <i className="bx bx-x text-base" />
              해제
            </button>
          ) : null}
          <button
            type="button"
            onClick={onStartCreate}
            className="hidden items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-black text-white shadow-sm transition hover:bg-slate-800 sm:inline-flex"
          >
            <i className="bx bx-plus text-base" />
            추가
          </button>
        </div>
      </header>

      <div
        ref={scrollAreaRef}
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4"
      >
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center"
          >
            <i className="bx bx-calendar-x text-4xl text-slate-300" />
            <p className="mt-2 text-sm font-black text-slate-500">
              이 날짜에 배정된 면접이 없어요
            </p>
            <p className="mt-1 text-xs font-bold text-slate-400">
              하단 리모콘에서 면접 일정을 추가해보세요.
            </p>
            <button
              type="button"
              onClick={onStartCreate}
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
            >
              <i className="bx bx-plus" />
              일정 추가
            </button>
          </motion.div>
        ) : (
          <>
            <motion.ol
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="space-y-2.5"
            >
              <AnimatePresence initial={false}>
                {visible.map((slot) => {
                  const checked = selectedSlotIds.includes(slot.slotId);
                  const status = getSlotStatusMeta(slot.slotStatus);
                  return (
                    <motion.li
                      key={slot.slotId}
                      variants={itemVariants}
                      layout
                      className={`relative overflow-hidden rounded-2xl border transition ${
                        checked
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleSlotSelection(slot.slotId)}
                        className="block w-full p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-black sm:text-base ${
                                checked ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {toLocalTime(slot.interviewStartsAt)} –{" "}
                              {toLocalTime(slot.interviewEndsAt)}
                            </p>
                            <p
                              className={`mt-0.5 truncate text-xs font-bold ${
                                checked ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              {slot.positionName ?? "직무 미지정"} ·{" "}
                              {slot.interviewRound}
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
                          className={`mt-2.5 grid gap-1.5 text-[11px] font-bold sm:grid-cols-2 sm:text-xs ${
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
                            className={`mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold sm:text-xs ${
                              checked
                                ? "bg-white/10 text-indigo-200"
                                : "bg-indigo-50 text-indigo-700"
                            }`}
                          >
                            <i className="bx bx-user-check" />
                            {slot.bookedCandidateNames.join(", ")}
                          </p>
                        ) : null}
                      </button>

                      <div
                        className={`flex items-center justify-between gap-2 border-t px-3 py-2 sm:px-4 ${
                          checked
                            ? "border-white/10 bg-white/5"
                            : "border-slate-100 bg-slate-50/60"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
                            checked ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          <i className="bx bx-id-card" />
                          Slot #{slot.slotId}
                        </span>
                        <button
                          type="button"
                          disabled={isDetailLoading}
                          onClick={(event) => {
                            event.stopPropagation();
                            void onOpenSlotDetail(slot);
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition disabled:opacity-50 sm:text-xs ${
                            checked
                              ? "bg-white/15 text-white hover:bg-white/25"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          <i className="bx bx-show-alt" />
                          자세히
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ol>

            {hasMore ? (
              <div
                ref={sentinelRef}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-3 text-[11px] font-black text-slate-500"
                aria-live="polite"
              >
                <motion.i
                  className="bx bx-loader-alt text-base"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                />
                <span>
                  다음 {Math.min(pageSize, total - visibleCount)}건 불러오는 중…
                </span>
                <button
                  type="button"
                  onClick={loadMore}
                  className="ml-1 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white transition hover:bg-slate-800"
                >
                  더 보기
                </button>
              </div>
            ) : visibleCount > pageSize ? (
              <p className="mt-3 flex items-center justify-center gap-1 text-[11px] font-black text-slate-400">
                <i className="bx bx-check-circle text-sm text-emerald-500" />
                모든 일정({total}건)을 확인했어요
              </p>
            ) : null}
          </>
        )}
      </div>
    </motion.aside>
  );
}
