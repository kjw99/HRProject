"use client";

import { motion } from "framer-motion";
import type { ScheduleCalendarViewMode } from "./types";

export interface ScheduleHeaderProps {
  headerTitle: string;
  viewMode: ScheduleCalendarViewMode;
  totalSlotCount: number;
  selectedDayCount: number;
  isLoading: boolean;
  onViewModeChange: (mode: ScheduleCalendarViewMode) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onJumpToday: () => void;
}

const VIEW_TABS: { key: ScheduleCalendarViewMode; label: string }[] = [
  { key: "month", label: "월" },
  { key: "week", label: "주" },
];

export function ScheduleHeader({
  headerTitle,
  viewMode,
  totalSlotCount,
  selectedDayCount,
  isLoading,
  onViewModeChange,
  onNavigatePrev,
  onNavigateNext,
  onJumpToday,
}: ScheduleHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),_0_8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur sm:px-7 sm:py-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-[80%] rounded-full bg-linear-to-br from-indigo-100 via-sky-100 to-transparent opacity-60 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600 ring-1 ring-indigo-100">
              <i className="bx bx-calendar-event text-sm" />
              HR · Schedule
            </span>
            {isLoading ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500"
              >
                <i className="bx bx-loader-alt animate-spin text-xs" />
                동기화
              </motion.span>
            ) : null}
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {headerTitle}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500 sm:text-sm">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
              <i className="bx bx-list-ul text-sm" />
              이번 {viewMode === "month" ? "달" : "주"} {totalSlotCount}건
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
              <i className="bx bx-calendar-check text-sm" />
              선택 일자 {selectedDayCount}건
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {VIEW_TABS.map((tab) => {
              const active = tab.key === viewMode;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onViewModeChange(tab.key)}
                  className="relative rounded-lg px-3.5 py-1.5 text-xs font-black text-slate-500 transition-colors hover:text-slate-700"
                >
                  {active ? (
                    <motion.span
                      layoutId="schedule-view-pill"
                      className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                  ) : null}
                  <span
                    className={`relative ${active ? "text-slate-900" : ""}`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={onNavigatePrev}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              aria-label="이전"
            >
              <i className="bx bx-chevron-left text-xl" />
            </button>
            <button
              type="button"
              onClick={onJumpToday}
              className="flex h-9 items-center justify-center rounded-lg px-3 text-xs font-black text-slate-700 transition hover:bg-slate-100"
            >
              오늘
            </button>
            <button
              type="button"
              onClick={onNavigateNext}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              aria-label="다음"
            >
              <i className="bx bx-chevron-right text-xl" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
