import type { BookingInviteStatus, HrStatusBadgeProps, HrStatusBadgeTone } from "@/types/hr-ui";

const TONE_CLASS: Record<HrStatusBadgeTone, string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  slate: "border-slate-200 bg-slate-100 text-slate-600",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

const INVITE_STATUS_META: Record<
  BookingInviteStatus,
  { label: string; icon: string; tone: HrStatusBadgeTone }
> = {
  active: { label: "유효", icon: "check-circle", tone: "emerald" },
  revoked: { label: "회수", icon: "block", tone: "rose" },
  expired: { label: "만료", icon: "time-five", tone: "amber" },
};

export function BookingInviteStatusBadge({
  status,
}: {
  status: BookingInviteStatus;
}) {
  const meta = INVITE_STATUS_META[status];
  return (
    <HrStatusBadge label={meta.label} icon={meta.icon} tone={meta.tone} />
  );
}

export default function HrStatusBadge({
  label,
  icon,
  tone = "slate",
  className = "",
}: HrStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black ${TONE_CLASS[tone]} ${className}`}
    >
      {icon ? <i className={`bx bx-${icon} text-sm`} /> : null}
      {label}
    </span>
  );
}
