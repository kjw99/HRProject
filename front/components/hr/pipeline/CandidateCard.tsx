import React from "react";
import { Candidate } from "@/types/hr";

interface CandidateCardProps {
  candidate: Candidate;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  // 점수에 따른 뱃지 색상 동적 렌더링
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (score >= 70) return "bg-blue-50 text-blue-600 border-blue-100";
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing group flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-slate-100 flex items-center justify-center text-slate-500 font-black text-lg border border-slate-200/60 shadow-sm">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-[16px] leading-tight">
              {candidate.name}
            </h4>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              ID: {candidate.id}
            </p>
          </div>
        </div>
        <button className="text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center">
          <i className="bx bx-dots-horizontal-rounded text-xl"></i>
        </button>
      </div>

      <div className="flex-1">
        <p className="text-[13px] text-slate-600 line-clamp-3 leading-relaxed mb-4 font-medium">
          {candidate.resumeSummary}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <i className="bx bx-time text-sm"></i> 업데이트 2일 전
        </div>
        {candidate.fitScore && (
          <div
            className={`px-3 py-1.5 rounded-[10px] text-[11px] font-black border flex items-center gap-1.5 shadow-sm ${getScoreColor(candidate.fitScore)}`}
          >
            <i className="bx bxs-magic-wand"></i> AI Fit {candidate.fitScore}%
          </div>
        )}
      </div>
    </div>
  );
}
