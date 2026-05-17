"use client";

import Link from "next/link";

interface InviteAcceptResultCardProps {
  status: "idle" | "loading" | "success" | "error";
  title: string;
  description: string;
  interviewerName?: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function InviteAcceptResultCard({
  status,
  title,
  description,
  interviewerName,
  actionHref,
  actionLabel,
}: InviteAcceptResultCardProps) {
  const tone =
    status === "success"
      ? {
          wrap: "border-emerald-200 bg-emerald-50",
          icon: "bx-check-circle text-emerald-600",
          title: "text-emerald-800",
          body: "text-emerald-700",
        }
      : status === "error"
        ? {
            wrap: "border-rose-200 bg-rose-50",
            icon: "bx-error-circle text-rose-600",
            title: "text-rose-800",
            body: "text-rose-700",
          }
        : {
            wrap: "border-indigo-200 bg-indigo-50",
            icon:
              status === "loading"
                ? "bx-loader-alt animate-spin text-indigo-600"
                : "bx-link-alt text-indigo-600",
            title: "text-indigo-800",
            body: "text-indigo-700",
          };

  return (
    <section className={`rounded-[28px] border p-6 shadow-sm ${tone.wrap}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80">
          <i className={`bx text-3xl ${tone.icon}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-xl font-black ${tone.title}`}>{title}</p>
          {interviewerName ? (
            <p className="mt-1 text-sm font-black text-slate-800">
              {interviewerName}
            </p>
          ) : null}
          <p className={`mt-2 text-sm font-semibold leading-6 ${tone.body}`}>
            {description}
          </p>

          {actionHref && actionLabel ? (
            <Link
              href={actionHref}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
            >
              <i className="bx bx-right-arrow-alt text-lg" />
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
