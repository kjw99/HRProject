import type { SlotStatusMeta, SlotStatusMetaMap } from "./types";

const FALLBACK_META: SlotStatusMeta = {
  label: "마감",
  className: "bg-slate-100 text-slate-500 ring-slate-200",
  dotClassName: "bg-slate-400",
};

const STATUS_META: SlotStatusMetaMap = {
  open: {
    label: "예약 가능",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dotClassName: "bg-emerald-500",
  },
  full: {
    label: "정원 마감",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    dotClassName: "bg-amber-500",
  },
  closed: FALLBACK_META,
};

export function getSlotStatusMeta(status: string): SlotStatusMeta {
  return STATUS_META[status as keyof SlotStatusMetaMap] ?? FALLBACK_META;
}
