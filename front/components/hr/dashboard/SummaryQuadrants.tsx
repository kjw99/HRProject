import React from "react";
import Link from "next/link";

// 💡 타입 정의
export interface Q1Data {
  todayIntervieweeCount: number;
  todayHiringTeamCount: number;
}

export interface Q2Data {
  totalApplicants: number;
  activeJobs: number;
}

// 💡 Q1Summary: 금일 면접 및 팀 현황 (가로형 고도화)
export function Q1Summary({ data }: { data: Q1Data }) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* 1사분면-좌: 면접자 수 */}
      <Link
        href="/hr/schedule"
        className="bg-white px-5 py-4 rounded-[20px] border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group flex items-center gap-4"
      >
        {/* 아이콘 크기를 약간 줄이고 여백 조정 */}
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <i className="bx bx-user-voice text-2xl"></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-tight mb-0.5">
            금일 면접자
          </h3>
          <p className="text-2xl font-black text-slate-800 flex items-center justify-between">
            <span>
              {data.todayIntervieweeCount}
              <span className="text-sm font-bold text-slate-400 ml-1">명</span>
            </span>
            <i className="bx bx-right-arrow-alt text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
          </p>
        </div>
      </Link>

      {/* 1사분면-우: 참여 팀 수 */}
      <div className="bg-white px-5 py-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
          <i className="bx bx-group text-2xl"></i>
        </div>
        <div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-tight mb-0.5">
            채용 직무
          </h3>
          <p className="text-2xl font-black text-slate-800">
            {data.todayHiringTeamCount}
            <span className="text-sm font-bold text-slate-400 ml-1">팀</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// 💡 Q2Summary: 전체 지원자 및 공고 현황 (가로형 고도화)
export function Q2Summary({ data }: { data: Q2Data }) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* 2사분면-좌: 총 지원자 */}
      <div className="bg-white px-5 py-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <i className="bx bx-id-card text-2xl"></i>
        </div>
        <div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-tight mb-0.5">
            총 지원자
          </h3>
          <p className="text-2xl font-black text-slate-800">
            {data.totalApplicants.toLocaleString()}
            <span className="text-sm font-bold text-slate-400 ml-1">명</span>
          </p>
        </div>
      </div>

      {/* 2사분면-우: 진행 직무 */}
      <div className="bg-white px-5 py-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
          <i className="bx bx-briefcase text-2xl"></i>
        </div>
        <div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-tight mb-0.5">
            진행 중인 채용
          </h3>
          <p className="text-2xl font-black text-slate-800">
            {data.activeJobs}
            <span className="text-sm font-bold text-slate-400 ml-1">개</span>
          </p>
        </div>
      </div>
    </div>
  );
}
