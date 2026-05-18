import {
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

const weekOptions = { weekStartsOn: 0 as const };

/** 월 그리드용: 해당 월이 속한 달력 주(일~토) 전체 */
export function getMonthCalendarDays(monthCursor: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthCursor), weekOptions);
  const end = endOfWeek(endOfMonth(monthCursor), weekOptions);
  return eachDayOfInterval({ start, end });
}

/** 주간 뷰: 앵커 날짜가 포함된 한 주(일~토) */
export function getWeekCalendarDays(weekAnchor: Date): Date[] {
  const start = startOfWeek(weekAnchor, weekOptions);
  const end = endOfWeek(weekAnchor, weekOptions);
  return eachDayOfInterval({ start, end });
}

export function shiftWeekAnchor(anchor: Date, direction: "prev" | "next"): Date {
  return addWeeks(anchor, direction === "prev" ? -1 : 1);
}
