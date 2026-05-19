"use client";

import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";
import { getSlotStatusMeta } from "./scheduleMeta";
import type {
  InterviewSlotListItem,
  InterviewSlotStatus,
} from "@/types/interviewSlotWrite";

export interface ScheduleDayHoverCardProps {
  day: Date;
  slots: InterviewSlotListItem[];
  /** 좌측/중앙/우측 정렬 — 셀이 그리드 가장자리에 있을 때 잘리지 않게 */
  horizontalAlign: "start" | "center" | "end";
  /** 위/아래 정렬 — 첫 행은 셀 아래쪽에 표시 */
  verticalAlign: "top" | "bottom";
}

const STATUS_ORDER: InterviewSlotStatus[] = ["open", "full", "closed"];

function countByStatus(slots: InterviewSlotListItem[]) {
  const result: Record<InterviewSlotStatus, number> = {
    open: 0,
    full: 0,
    closed: 0,
  };
  for (const slot of slots) {
    result[slot.slotStatus] = (result[slot.slotStatus] ?? 0) + 1;
  }
  return result;
}

const horizontalClass: Record<
  ScheduleDayHoverCardProps["horizontalAlign"],
  string
> = {
  start: "left-1",
  center: "left-1/2 -translate-x-1/2",
  end: "right-1",
};

const verticalClass: Record<
  ScheduleDayHoverCardProps["verticalAlign"],
  string
> = {
  top: "bottom-full mb-2",
  bottom: "top-full mt-2",
};

export function ScheduleDayHoverCard({
  day,
  slots,
  horizontalAlign,
  verticalAlign,
}: ScheduleDayHoverCardProps) {
  const counts = countByStatus(slots);
  const sorted = [...slots].sort(
    (a, b) =>
      parseISO(a.interviewStartsAt).getTime() -
      parseISO(b.interviewStartsAt).getTime(),
  );
  const preview = sorted.slice(0, 3);
  const restCount = slots.length - preview.length;

  return (
    <motion.div
      role="tooltip"
      initial={{ opacity: 0, y: verticalAlign === "top" ? 4 : -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none absolute z-30 hidden w-[240px] origin-top rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:block ${horizontalClass[horizontalAlign]} ${verticalClass[verticalAlign]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
            Day · Preview
          </p>
          <p className="truncate text-sm font-black text-slate-900">
            {format(day, "M월 d일 (EEE)", { locale: ko })}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white">
          총 {slots.length}건
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {STATUS_ORDER.map((status) => {
          const meta = getSlotStatusMeta(status);
          const value = counts[status] ?? 0;
          return (
            <div
              key={status}
              className={`flex flex-col items-start gap-0.5 rounded-lg px-2 py-1.5 ring-1 ${
                value > 0
                  ? meta.className
                  : "bg-slate-50 text-slate-400 ring-slate-100"
              }`}
            >
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider">
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
                {meta.label}
              </span>
              <span className="text-sm font-black">{value}</span>
            </div>
          );
        })}
      </div>

      <ul className="mt-2.5 space-y-1.5">
        {preview.map((slot) => {
          const start = format(parseISO(slot.interviewStartsAt), "HH:mm");
          const end = format(parseISO(slot.interviewEndsAt), "HH:mm");
          const meta = getSlotStatusMeta(slot.slotStatus);
          return (
            <li
              key={slot.slotId}
              className="flex items-center gap-2 rounded-lg bg-slate-50/80 px-2 py-1.5 text-[11px] font-bold text-slate-600"
            >
              <span
                className={`shrink-0 h-1.5 w-1.5 rounded-full ${meta.dotClassName}`}
              />
              <span className="shrink-0 font-black text-slate-900">
                {start}–{end}
              </span>
              <span className="min-w-0 truncate">
                {slot.positionName ?? "직무 미지정"} · {slot.interviewRound}
              </span>
            </li>
          );
        })}
        {restCount > 0 ? (
          <li className="text-center text-[10px] font-black text-slate-400">
            + {restCount}건 더 보기
          </li>
        ) : null}
      </ul>

      <p className="mt-2.5 flex items-center justify-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-600">
        <i className="bx bx-mouse-alt" />
        클릭하여 상세 보기
      </p>
    </motion.div>
  );
}
