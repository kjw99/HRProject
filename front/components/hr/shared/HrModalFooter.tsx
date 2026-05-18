"use client";

import type { HrModalAction, HrModalFooterProps } from "@/types/hr-ui";

const VARIANT_CLASS: Record<
  NonNullable<HrModalAction["variant"]>,
  string
> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500/30",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-500/20",
  ghost:
    "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-500/20",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-500/25",
};

const BASE_BUTTON =
  "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function HrModalFooter({
  actions,
  align = "end",
}: HrModalFooterProps) {
  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row ${
        align === "end" ? "sm:justify-end" : "sm:justify-stretch"
      }`}
    >
      {actions.map((action) => {
        const variant = action.variant ?? "secondary";
        const iconName =
          action.loading && action.icon
            ? "loader-alt"
            : action.icon;

        return (
          <button
            key={action.label}
            type={action.type ?? "button"}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className={`${BASE_BUTTON} ${VARIANT_CLASS[variant]} ${
              align === "stretch" ? "sm:flex-1" : ""
            }`}
          >
            {iconName ? (
              <i
                className={`bx bx-${iconName} text-lg ${
                  action.loading ? "animate-spin" : ""
                }`}
              />
            ) : null}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
