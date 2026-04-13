import React from "react";
import { JobPosting, Candidate } from "@/types/hr";

interface ControlPanelProps {
  selectedJob: string;
  setSelectedJob: (id: string) => void;
  selectedCandidate: string;
  setSelectedCandidate: (id: string) => void;
  isGenerating: boolean;
  onGenerateAI: () => void;
  jobPostings: JobPosting[];
  candidates: Candidate[];
}

export default function ControlPanel({
  selectedJob,
  setSelectedJob,
  selectedCandidate,
  setSelectedCandidate,
  isGenerating,
  onGenerateAI,
  jobPostings,
  candidates,
}: ControlPanelProps) {
  const currentJob = jobPostings.find((j) => j.id === selectedJob);
  const currentCandidate = candidates.find((c) => c.id === selectedCandidate);

  return (
    <div className="lg:col-span-4 space-y-8">
      {/* 1. 대상 공고 설정 카드 */}
      <div className="bg-white p-7 lg:p-9 rounded-4xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] border border-blue-100">
            01
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            대상 공고 설정
          </h3>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <select
              className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all"
              value={selectedJob}
              onChange={(e) => {
                setSelectedJob(e.target.value);
                setSelectedCandidate("");
              }}
            >
              <option value="">공고를 선택하세요</option>
              {jobPostings.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <i className="bx bx-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-2xl pointer-events-none"></i>
          </div>

          {currentJob && (
            <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <i className="bx bx-check-double text-blue-500"></i>
                <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">
                  직무 분석 데이터
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentJob.keySkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-white text-blue-600 text-[11px] font-black rounded-xl border border-blue-100 shadow-sm"
                  >
                    #{skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 지원자 분석 대상 카드 */}
      <div className="bg-white p-7 lg:p-9 rounded-4xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-[10px] border border-slate-100">
            02
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            지원자 분석 대상
          </h3>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <select
              className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none disabled:opacity-40 cursor-pointer transition-all"
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              disabled={!selectedJob}
            >
              <option value="">지원자를 선택하세요</option>
              {candidates
                .filter((c) => c.appliedJob === selectedJob)
                .map((cnd) => (
                  <option key={cnd.id} value={cnd.id}>
                    {cnd.name}
                  </option>
                ))}
            </select>
            <i className="bx bx-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-2xl pointer-events-none"></i>
          </div>

          {currentCandidate && (
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-500">
              <p className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                이력서 핵심 요약
              </p>
              <p className="text-[13px] text-slate-600 leading-relaxed font-semibold italic">{`"${currentCandidate.resumeSummary}"`}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. 액션 버튼 */}
      <button
        onClick={onGenerateAI}
        disabled={isGenerating || !selectedJob || !selectedCandidate}
        className="group relative w-full py-5 bg-linear-to-br from-indigo-600 to-blue-600 text-white rounded-[28px] font-black text-[16px] shadow-[0_10px_25px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.4)] disabled:opacity-30 disabled:shadow-none active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {isGenerating ? (
          <>
            <i className="bx bx-loader-alt bx-spin text-2xl"></i> 에이전트 추론
            중...
          </>
        ) : (
          <>
            <i className="bx bxs-magic-wand text-yellow-300 text-2xl animate-pulse"></i>{" "}
            ✨ AI 심층 면접 리포트 생성
          </>
        )}
      </button>
    </div>
  );
}
