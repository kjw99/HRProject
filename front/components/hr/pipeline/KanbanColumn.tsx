import React from "react";
import { Candidate } from "@/types/hr";
import CandidateCard from "./CandidateCard";

interface KanbanColumnProps {
  title: string;
  count: number;
  icon: string;
  colorClass: string;
  candidates: Candidate[];
}

export default function KanbanColumn({
  title,
  count,
  icon,
  colorClass,
  candidates,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-slate-50/70 rounded-4xl border border-slate-200/80 p-5 h-full min-h-150 min-w-[320px] lg:min-w-0 flex-1 snap-center shrink-0">
      {/* 칼럼 헤더 */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 ${colorClass}`}
          >
            <i className={`bx ${icon} text-[22px]`}></i>
          </div>
          <h3 className="font-black text-slate-800 text-[17px] tracking-tight">
            {title}
          </h3>
        </div>
        <span className="bg-white px-3 py-1 rounded-[10px] text-[13px] font-black text-slate-500 border border-slate-200 shadow-sm">
          {count}
        </span>
      </div>

      {/* 카드 리스트 영역 (스크롤) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 space-y-4 pb-4 styled-scrollbar">
        {candidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}

        {/* 빈 상태 UI */}
        {candidates.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2 bg-white/50">
            <i className="bx bx-ghost text-2xl text-slate-300"></i>
            <span className="text-[13px] font-bold">지원자 없음</span>
          </div>
        )}
      </div>
    </div>
  );
}
