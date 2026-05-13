"use client";

import { DeptStatus } from "@/types/hr";
import type { UpcomingInterview } from "./types";

interface DeptStatusCardProps {
  item: DeptStatus;
  onOpenDetail: (deptName: string) => void;
  onOpenAssign: (data: UpcomingInterview) => void;
}

export default function DeptStatusCard({
  item,
  onOpenDetail,
  onOpenAssign,
}: DeptStatusCardProps) {
  const updatedLabel = item.lastUpdated
    ? new Date(item.lastUpdated).toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(item.deptName)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(item.deptName);
        }
      }}
      className="group relative cursor-pointer rounded-[20px] border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-5"
    >
      <i className="bx bx-right-top-arrow-circle absolute right-3 top-3 text-2xl text-slate-200 opacity-0 transition-all duration-300 group-hover:text-indigo-400 group-hover:opacity-100 sm:right-4 sm:top-4" />

      <div className="relative z-10 mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="mb-1 flex items-center gap-2 text-base font-black text-slate-800">
            <i className="bx bx-buildings shrink-0 text-indigo-400 sm:hidden" />
            <span className="truncate">{item.deptName}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs font-bold text-indigo-600">
              {item.currentProgress}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAssign({
              id: item.id,
              date: item.lastUpdated?.toString() || new Date().toISOString(),
              team: item.deptName,
              round: item.currentProgress,
              expType: "무관",
              intervieweeCount:
                item.experienced.intervieweeCount +
                item.newcomer.intervieweeCount,
              applicantCount:
                item.experienced.applicantCount + item.newcomer.applicantCount,
            });
          }}
          className="flex shrink-0 items-center gap-1 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white sm:self-auto"
        >
          <i className="bx bx-user-plus text-sm" />
          면접관 할당
        </button>
      </div>

      <div className="relative z-10 space-y-2.5">
        <p className="ml-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <i className="bx bx-time-five text-[11px]" />
          {updatedLabel} 업데이트
        </p>

        <div className="flex items-center justify-between rounded-xl border border-slate-100/50 bg-slate-50/80 p-3">
          <span className="flex items-center gap-2 text-xs font-black text-slate-700">
            <span className="h-3 w-1.5 rounded-full bg-indigo-500" />
            경력직
          </span>
          <div className="flex gap-3 sm:gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold uppercase text-slate-400">
                면접 대상
              </span>
              <span className="text-xs font-black text-slate-800">
                {item.experienced.intervieweeCount}명
              </span>
            </div>
            <div className="flex flex-col items-end border-l border-slate-200 pl-3 sm:pl-4">
              <span className="text-[9px] font-bold uppercase text-slate-400">
                전체 지원
              </span>
              <span className="text-xs font-black text-slate-800">
                {item.experienced.applicantCount}명
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100/50 bg-slate-50/80 p-3">
          <span className="flex items-center gap-2 text-xs font-black text-slate-700">
            <span className="h-3 w-1.5 rounded-full bg-emerald-500" />
            신입(인턴)
          </span>
          <div className="flex gap-3 sm:gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold uppercase text-slate-400">
                면접 대상
              </span>
              <span className="text-xs font-black text-slate-800">
                {item.newcomer.intervieweeCount}명
              </span>
            </div>
            <div className="flex flex-col items-end border-l border-slate-200 pl-3 sm:pl-4">
              <span className="text-[9px] font-bold uppercase text-slate-400">
                전체 지원
              </span>
              <span className="text-xs font-black text-slate-800">
                {item.newcomer.applicantCount}명
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
