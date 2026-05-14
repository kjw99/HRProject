"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format, isSameDay, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import type { InterviewSlotListItem } from "@/types/interviewSlotWrite";
import type { ScheduleCalendarViewMode } from "./types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export interface ScheduleCalendarPanelProps {
  viewMode: ScheduleCalendarViewMode;
  onViewModeChange: (mode: ScheduleCalendarViewMode) => void;
  calendarOpen: boolean;
  onToggleCalendarOpen: () => void;
  headerTitle: string;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  gridDays: Date[];
  displayMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  slotsByDate: Record<string, InterviewSlotListItem[]>;
}

export function ScheduleCalendarPanel({
  viewMode,
  onViewModeChange,
  calendarOpen,
  onToggleCalendarOpen,
  headerTitle,
  onNavigatePrev,
  onNavigateNext,
  gridDays,
  displayMonth,
  selectedDate,
  onSelectDate,
  slotsByDate,
}: ScheduleCalendarPanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-black/4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Calendar
          </p>
          <h2 className="truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            {headerTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange("month")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-black transition sm:px-3 ${
                viewMode === "month"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              월
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("week")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-black transition sm:px-3 ${
                viewMode === "week"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              주
            </button>
          </div>
          <button
            type="button"
            onClick={onNavigatePrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="이전"
          >
            <i className="bx bx-chevron-left text-xl" />
          </button>
          <button
            type="button"
            onClick={onNavigateNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="다음"
          >
            <i className="bx bx-chevron-right text-xl" />
          </button>
          <button
            type="button"
            onClick={onToggleCalendarOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-800"
            aria-expanded={calendarOpen}
            aria-label={calendarOpen ? "달력 접기" : "달력 펼치기"}
          >
            <i
              className={`bx text-lg ${
                calendarOpen ? "bx-chevron-up" : "bx-chevron-down"
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {calendarOpen && (
          <motion.div
            key={viewMode}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/90">
              {WEEKDAY_LABELS.map((day) => (
                <div
                  key={day}
                  className="px-1 py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 sm:text-[11px]"
                >
                  {day}
                </div>
              ))}
            </div>
            <div
              className={`grid bg-white ${
                viewMode === "week"
                  ? "grid-cols-7"
                  : "grid-cols-7 auto-rows-fr sm:auto-rows-[minmax(5.5rem,1fr)]"
              }`}
            >
              {gridDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const daySlots = slotsByDate[key] ?? [];
                const selected = isSameDay(day, selectedDate);
                const muted = !isSameMonth(day, displayMonth);
                return (
                  <button
                    key={`${viewMode}-${key}`}
                    type="button"
                    onClick={() => onSelectDate(day)}
                    className={`flex min-h-17 flex-col border-b border-r border-slate-100 p-1.5 text-left transition last:border-r-0 sm:min-h-21 sm:p-2 ${
                      selected
                        ? "bg-indigo-50 ring-1 ring-inset ring-indigo-200"
                        : "bg-white hover:bg-slate-50/90"
                    } ${muted ? "text-slate-300" : "text-slate-800"}`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        selected
                          ? "bg-slate-900 text-white shadow-sm"
                          : muted
                            ? "text-slate-300"
                            : "text-slate-700"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-auto flex flex-wrap gap-0.5 pt-1">
                      {daySlots.slice(0, viewMode === "week" ? 6 : 3).map((slot) => (
                        <span
                          key={slot.slotId}
                          className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                          title={slot.interviewRound}
                        />
                      ))}
                      {daySlots.length > (viewMode === "week" ? 6 : 3) && (
                        <span className="text-[9px] font-black leading-none text-indigo-600 sm:text-[10px]">
                          +{daySlots.length - (viewMode === "week" ? 6 : 3)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-2 text-center text-[10px] font-semibold text-slate-400 sm:text-xs">
              선택:{" "}
              <span className="font-black text-slate-700">
                {format(selectedDate, "yyyy.MM.dd (EEE)", { locale: ko })}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
