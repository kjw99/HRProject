"use client";

import { truncateEmailForDisplay } from "@/lib/hr/format-email";

interface ApplicantEmailValueProps {
  email: string | null | undefined;
  emptyLabel?: string;
  className?: string;
}

export default function ApplicantEmailValue({
  email,
  emptyLabel = "미등록",
  className = "",
}: ApplicantEmailValueProps) {
  const trimmed = email?.trim();
  if (!trimmed) {
    return (
      <p
        className={`mt-2 text-sm font-semibold text-slate-400 ${className}`.trim()}
      >
        {emptyLabel}
      </p>
    );
  }

  const { full, display, isTruncated } = truncateEmailForDisplay(trimmed);

  return (
    <div className={`group/email relative mt-2 min-w-0 ${className}`.trim()}>
      <a
        href={`mailto:${full}`}
        className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-indigo-700 underline-offset-2 transition hover:text-indigo-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
        title={isTruncated ? undefined : full}
        aria-label={isTruncated ? `이메일: ${full}` : undefined}
      >
        <i
          className="bx bx-envelope shrink-0 text-base text-indigo-400"
          aria-hidden
        />
        <span className="min-w-0 truncate">{display}</span>
        {isTruncated ? (
          <i
            className="bx bx-dots-horizontal-rounded shrink-0 text-slate-300"
            aria-hidden
          />
        ) : null}
      </a>

      {isTruncated ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 hidden w-max max-w-[min(100vw-3rem,320px)] animate-in fade-in slide-in-from-top-1 duration-150 group-hover/email:block group-focus-within/email:block"
        >
          <div className="rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-medium leading-relaxed text-white shadow-lg shadow-slate-900/25">
            <p className="mb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              전체 이메일
            </p>
            <p className="break-all">{full}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
