"use client";

import React, { useState } from "react";
import { Candidate } from "@/types/hr";
import KanbanColumn from "./KanbanColumn";
import FilterModal from "./FilterModal";
import AddCandidateModal from "./AddCandidateModal";

interface PipelineClientProps {
  initialCandidates: Candidate[];
}

export default function PipelineClient({
  initialCandidates,
}: PipelineClientProps) {
  // 1. 전역 상태 관리
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  // 모달 상태
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 필터 상태
  const [filterJob, setFilterJob] = useState("");
  const [filterMinScore, setFilterMinScore] = useState<number>(0);

  // 새 지원자 추가 폼 상태
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    appliedJob: "",
    resumeSummary: "",
  });

  // 2. 필터링 로직 적용
  const filteredCandidates = candidates.filter((candidate) => {
    const matchJob = filterJob ? candidate.appliedJob === filterJob : true;
    const matchScore = candidate.fitScore
      ? candidate.fitScore >= filterMinScore
      : true;
    return matchJob && matchScore;
  });

  // 3. 상태별 분류 (필터링된 결과 기반)
  const applied = filteredCandidates.filter((c) => c.status === "applied");
  const screening = filteredCandidates.filter((c) => c.status === "screening");
  const interview = filteredCandidates.filter((c) => c.status === "interview");
  const offered = filteredCandidates.filter((c) => c.status === "offered");

  // 4. 지원자 추가 핸들러
  const handleAddCandidate = () => {
    if (!newCandidate.name || !newCandidate.appliedJob) {
      alert("이름과 지원 직무를 입력해주세요.");
      return;
    }

    const newEntry: Candidate = {
      id: `cnd_${Date.now()}`,
      name: newCandidate.name,
      appliedJob: newCandidate.appliedJob,
      resumeSummary:
        newCandidate.resumeSummary || "입력된 이력서 요약이 없습니다.",
      status: "applied", // 기본 상태는 '신규 지원'
      fitScore: Math.floor(Math.random() * 30) + 70, // 70~99 사이의 랜덤 점수 부여 (시뮬레이션)
    };

    setCandidates([newEntry, ...candidates]);
    setIsAddOpen(false);
    setNewCandidate({ name: "", appliedJob: "", resumeSummary: "" }); // 폼 초기화
  };

  const handleResetFilter = () => {
    setFilterJob("");
    setFilterMinScore(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-[0.98] duration-700 h-full flex flex-col relative">
      {/* 파이프라인 헤더 */}
      <header className="border-b border-slate-200/60 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-[10px] text-[11px] font-black uppercase tracking-[0.2em] border border-indigo-100/50 shadow-sm">
            <i className="bx bx-git-branch text-sm"></i> ATS Pipeline
          </div>
          <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight">
            지원자 파이프라인
          </h2>
          <p className="text-slate-500 font-semibold text-[14px] md:text-[15px] max-w-2xl leading-relaxed">
            전체 채용 전형의 진행 상황을 한눈에 파악하고 드래그 앤 드롭으로
            관리하세요.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* 상세 필터 버튼 */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex-1 lg:flex-none px-5 py-3.5 font-bold rounded-2xl border shadow-sm transition-all flex items-center justify-center gap-2 text-[14px] ${
              filterJob || filterMinScore > 0
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <i className="bx bx-filter-alt text-lg"></i>
            상세 필터{" "}
            {(filterJob || filterMinScore > 0) && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></span>
            )}
          </button>

          {/* 지원자 추가 버튼 */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex-1 lg:flex-none px-5 py-3.5 bg-slate-900 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 text-[14px]"
          >
            <i className="bx bx-user-plus text-lg"></i> 지원자 추가
          </button>
        </div>
      </header>

      {/* 칸반 보드 컨테이너 */}
      <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar flex-1 min-h-0">
        <KanbanColumn
          title="신규 지원"
          count={applied.length}
          icon="bx-envelope"
          colorClass="bg-white text-slate-600"
          candidates={applied}
        />
        <KanbanColumn
          title="AI 서류 검토"
          count={screening.length}
          icon="bx-brain"
          colorClass="bg-blue-500 text-white"
          candidates={screening}
        />
        <KanbanColumn
          title="심층 면접"
          count={interview.length}
          icon="bx-conversation"
          colorClass="bg-indigo-500 text-white"
          candidates={interview}
        />
        <KanbanColumn
          title="최종 합격"
          count={offered.length}
          icon="bx-party"
          colorClass="bg-emerald-500 text-white"
          candidates={offered}
        />
      </div>

      {/* 분리된 모달 컴포넌트 렌더링 */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filterJob={filterJob}
        setFilterJob={setFilterJob}
        filterMinScore={filterMinScore}
        setFilterMinScore={setFilterMinScore}
        onReset={handleResetFilter}
      />

      <AddCandidateModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        newCandidate={newCandidate}
        setNewCandidate={setNewCandidate}
        onSubmit={handleAddCandidate}
      />
    </div>
  );
}
