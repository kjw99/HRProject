"use client";

import { motion } from "framer-motion";
import { format, isSameDay, isSameMonth, isToday } from "date-fns";
import { ScheduleCalendarCell } from "./ScheduleCalendarCell";
import type { InterviewSlotListItem } from "@/types/interviewSlotWrite";
import type { ScheduleCalendarViewMode } from "./types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export interface ScheduleCalendarPanelProps {
  viewMode: ScheduleCalendarViewMode;
  gridDays: Date[];
  displayMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  slotsByDate: Record<string, InterviewSlotListItem[]>;
}

export function ScheduleCalendarPanel({
  viewMode,
  gridDays,
  displayMonth,
  selectedDate,
  onSelectDate,
  slotsByDate,
}: ScheduleCalendarPanelProps) {
  const totalRows = Math.max(1, Math.ceil(gridDays.length / 7));

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04),_0_8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur"
      aria-label="면접 일정 캘린더"
    >
      <header className="flex shrink-0 items-center justify-between rounded-t-3xl border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <i className="bx bx-calendar text-lg" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Calendar
            </p>
            <p className="text-sm font-black text-slate-900">
              {viewMode === "month" ? "월간 보기" : "주간 보기"}
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-3 text-[11px] font-bold text-slate-500 sm:flex">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            예약 가능
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            정원 마감
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            종료
          </span>
        </div>
      </header>

      <div className="grid shrink-0 grid-cols-7 border-b border-slate-100 bg-slate-50/70">
        {WEEKDAY_LABELS.map((day, idx) => (
          <div
            key={day}
            className={`px-1 py-2 text-center text-[10px] font-black uppercase tracking-wider sm:text-[11px] ${
              idx === 0
                ? "text-rose-500"
                : idx === 6
                  ? "text-sky-500"
                  : "text-slate-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className="relative grid min-h-0 flex-1 auto-rows-fr grid-cols-7 rounded-b-3xl bg-white"
        style={{
          gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`,
        }}
      >
        {gridDays.map((day, index) => {
          const key = format(day, "yyyy-MM-dd");
          const daySlots = slotsByDate[key] ?? [];
          return (
            <ScheduleCalendarCell
              key={`${viewMode}-${key}`}
              day={day}
              viewMode={viewMode}
              selected={isSameDay(day, selectedDate)}
              muted={!isSameMonth(day, displayMonth)}
              today={isToday(day)}
              daySlots={daySlots}
              rowIndex={Math.floor(index / 7)}
              totalRows={totalRows}
              columnIndex={index % 7}
              onSelect={onSelectDate}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
