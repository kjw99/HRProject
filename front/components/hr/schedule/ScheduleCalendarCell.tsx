"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ScheduleDayHoverCard } from "./ScheduleDayHoverCard";
import { getSlotStatusMeta } from "./scheduleMeta";
import type {
  InterviewSlotListItem,
  InterviewSlotStatus,
} from "@/types/interviewSlotWrite";
import type { ScheduleCalendarViewMode } from "./types";

export interface ScheduleCalendarCellProps {
  day: Date;
  viewMode: ScheduleCalendarViewMode;
  selected: boolean;
  muted: boolean;
  today: boolean;
  daySlots: InterviewSlotListItem[];
  /** 0-based row index within the grid */
  rowIndex: number;
  /** total number of rows in the grid (used for popover position) */
  totalRows: number;
  /** 0..6 within the row */
  columnIndex: number;
  onSelect: (day: Date) => void;
}

const STATUS_PRIORITY: InterviewSlotStatus[] = ["open", "full", "closed"];

function topStatusOf(slots: InterviewSlotListItem[]): InterviewSlotStatus | null {
  if (slots.length === 0) return null;
  for (const status of STATUS_PRIORITY) {
    if (slots.some((slot) => slot.slotStatus === status)) {
      return status;
    }
  }
  return slots[0].slotStatus;
}

export function ScheduleCalendarCell({
  day,
  viewMode,
  selected,
  muted,
  today,
  daySlots,
  rowIndex,
  totalRows,
  columnIndex,
  onSelect,
}: ScheduleCalendarCellProps) {
  const topStatus = topStatusOf(daySlots);
  const dayOfWeek = day.getDay();
  const maxDots = viewMode === "week" ? 6 : 3;
  const visibleDots = daySlots.slice(0, maxDots);
  const restCount = daySlots.length - maxDots;

  const horizontalAlign: "start" | "center" | "end" =
    columnIndex <= 1 ? "start" : columnIndex >= 5 ? "end" : "center";
  const verticalAlign: "top" | "bottom" =
    totalRows <= 2 || rowIndex <= 1 ? "bottom" : "top";

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      aria-pressed={selected}
      aria-label={`${format(day, "yyyy년 M월 d일 EEEE", { locale: ko })} · ${daySlots.length}건`}
      className={`group/cell relative flex min-h-0 flex-col items-stretch border-b border-r border-slate-100 p-1.5 text-left transition last:border-r-0 hover:z-20 focus-visible:z-20 sm:p-2 ${
        selected ? "bg-indigo-50/80" : "bg-white hover:bg-slate-50/70"
      }`}
    >
      {selected ? (
        <motion.span
          layoutId="calendar-selected-ring"
          className="pointer-events-none absolute inset-1 rounded-xl ring-2 ring-indigo-500/70"
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-1">
        <span
          className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-black sm:text-xs ${
            today
              ? "bg-slate-900 text-white shadow-sm"
              : muted
                ? "text-slate-300"
                : dayOfWeek === 0
                  ? "text-rose-500"
                  : dayOfWeek === 6
                    ? "text-sky-500"
                    : "text-slate-700"
          }`}
        >
          {format(day, "d")}
        </span>
        {daySlots.length > 0 ? (
          <span
            className={`hidden rounded-full px-1.5 py-0.5 text-[9px] font-black sm:inline-flex ${
              selected
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {daySlots.length}
          </span>
        ) : null}
      </div>

      <div className="relative mt-auto flex flex-wrap items-center gap-1 pt-1">
        {visibleDots.map((slot) => (
          <span
            key={slot.slotId}
            className={`h-1.5 w-1.5 rounded-full ${getSlotStatusMeta(slot.slotStatus).dotClassName}`}
          />
        ))}
        {restCount > 0 ? (
          <span className="text-[9px] font-black leading-none text-indigo-600 sm:text-[10px]">
            +{restCount}
          </span>
        ) : null}
      </div>

      {topStatus && !selected ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-2 bottom-0 h-[2px] rounded-full opacity-70 ${getSlotStatusMeta(topStatus).dotClassName}`}
        />
      ) : null}

      {daySlots.length > 0 ? (
        <div
          className="pointer-events-none absolute inset-0 hidden group-hover/cell:block group-focus-visible/cell:block"
          aria-hidden
        >
          <ScheduleDayHoverCard
            day={day}
            slots={daySlots}
            horizontalAlign={horizontalAlign}
            verticalAlign={verticalAlign}
          />
        </div>
      ) : null}
    </button>
  );
}
