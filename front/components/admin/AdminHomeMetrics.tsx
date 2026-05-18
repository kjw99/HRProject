"use client";

import Link from "next/link";
import { ADMIN_METRIC_LINKS } from "./admin-home.constants";
import type { AdminHomeMetricsProps, AdminOperationalMetric } from "@/types/admin-ui";

export default function AdminHomeMetrics({
  initialUserCount,
}: AdminHomeMetricsProps) {
  const metrics: AdminOperationalMetric[] = ADMIN_METRIC_LINKS.map((item) => ({
    ...item,
    value:
      item.id === "users"
        ? `${initialUserCount}명`
        : "바로가기",
  }));

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <Link
          key={metric.id}
          href={metric.href}
          className="group rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-4 text-white shadow-lg transition hover:border-indigo-400/60 hover:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {metric.label}
              </p>
              <p className="mt-1 text-xl font-black tabular-nums">
                {metric.value}
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-400 group-hover:text-slate-300">
                {metric.hint}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
              <i className={`bx bx-${metric.icon} text-xl`} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
