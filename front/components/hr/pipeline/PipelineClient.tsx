"use client";

import React, { useState } from "react";
import { Candidate } from "@/types/hr";
import KanbanColumn from "./KanbanColumn";
import FilterModal from "./FilterModal";
import AddCandidateModal from "./AddCandidateModal";
import CandidateModal from "./CandidateModal";
import DeleteConfirmModal from "../../admin/accounts/DeleteConfirmModal";

interface PipelineClientProps {
  initialCandidates: Candidate[];
}

export default function PipelineClient({ initialCandidates }: PipelineClientProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterJob, setFilterJob] = useState('');
  const [filterMinScore, setFilterMinScore] = useState<number>(0);

  // 폼(추가/수정) 모달 상태
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCandidate, setNewCandidate] = useState({ name: '', appliedJob: '', resumeSummary: '' });

  // 삭제 모달 상태
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);

  // 뷰 모드 및 정렬 상태
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [sortBy, setSortBy] = useState<'newest' | 'score_desc'>('score_desc');

  // 🚀 다중 선택 상태 (Bulk Actions)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 드롭된 카드의 상태(status) 업데이트
  const handleDropCandidate = (candidateId: string, newStatus: string) => {
    setCandidates(prev => prev.map(cnd =>
      cnd.id === candidateId ? { ...cnd, status: newStatus as any } : cnd
    ));
  };

  // 🚀 체크박스 토글 함수
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  // 🚀 일괄 이동 처리 함수
  const handleBulkMove = (newStatus: string) => {
    setCandidates(prev => prev.map(cnd =>
      selectedIds.includes(cnd.id) ? { ...cnd, status: newStatus as any } : cnd
    ));
    setSelectedIds([]); // 처리 후 선택 해제
  };

  // 모달 열기 제어 함수
  const openAddModal = () => {
    setNewCandidate({ name: '', appliedJob: '', resumeSummary: '' });
    setIsEditMode(false);
    setEditingId(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (candidate: Candidate) => {
    setNewCandidate({ name: candidate.name, appliedJob: candidate.appliedJob, resumeSummary: candidate.resumeSummary });
    setIsEditMode(true);
    setEditingId(candidate.id);
    setIsFormModalOpen(true);
  };

  // 지원자 폼 서밋 (추가/수정 통합)
  const handleSubmitCandidate = () => {
    if (isEditMode && editingId) {
      // 수정 로직
      setCandidates(prev => prev.map(c =>
        c.id === editingId ? { ...c, name: newCandidate.name, appliedJob: newCandidate.appliedJob, resumeSummary: newCandidate.resumeSummary } : c
      ));
    } else {
      // 추가 로직
      const newEntry: Candidate = {
        id: `cnd_${Date.now()}`,
        name: newCandidate.name,
        appliedJob: newCandidate.appliedJob,
        resumeSummary: newCandidate.resumeSummary || '요약 없음',
        status: 'applied',
        fitScore: Math.floor(Math.random() * 30) + 70
      };
      setCandidates([newEntry, ...candidates]);
    }
    setIsFormModalOpen(false);
  };

  // 지원자 삭제 실행
  const executeDeleteCandidate = () => {
    if (candidateToDelete) {
      setCandidates(prev => prev.filter(c => c.id !== candidateToDelete));
      setCandidateToDelete(null);
    }
  };

  // 필터 및 정렬 적용
  const filteredCandidates = candidates.filter(candidate => {
    const matchJob = filterJob ? candidate.appliedJob === filterJob : true;
    const matchScore = candidate.fitScore ? candidate.fitScore >= filterMinScore : true;
    return matchJob && matchScore;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'score_desc') return (b.fitScore || 0) - (a.fitScore || 0);
    return 0;
  });

  const applied = sortedCandidates.filter(c => c.status === 'applied');
  const screening = sortedCandidates.filter(c => c.status === 'screening');
  const interview = sortedCandidates.filter(c => c.status === 'interview');
  const offered = sortedCandidates.filter(c => c.status === 'offered');
  const rejected = sortedCandidates.filter(c => c.status === 'rejected');

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-[0.98] duration-700 h-full flex flex-col relative">
      <header className="border-b border-slate-200/60 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-[10px] text-[11px] font-black uppercase tracking-[0.2em] border border-indigo-100/50 shadow-sm">
            <i className='bx bx-git-branch text-sm'></i> Drag & Drop ATS
          </div>
          <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight">지원자 파이프라인</h2>
          <p className="text-slate-500 font-semibold text-[14px] md:text-[15px] max-w-2xl leading-relaxed">
            지원자 카드를 드래그하여 전형 단계를 이동시키세요. 우측 상단 옵션(•••)을 통해 세부 관리도 가능합니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-auto">
          {/* 상단 컨트롤 패널 (뷰 모드 및 정렬) */}
          <div className="flex justify-end gap-2 mb-1">
            <div className="flex items-center bg-slate-100 p-1 rounded-[12px] border border-slate-200">
              <button
                onClick={() => setViewMode('detailed')}
                className={`p-1.5 rounded-[8px] transition-all flex items-center justify-center ${viewMode === 'detailed' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="상세 보기"
              >
                <i className='bx bx-menu text-lg'></i>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-[8px] transition-all flex items-center justify-center ${viewMode === 'compact' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="간략히 보기"
              >
                <i className='bx bx-grid-alt text-lg'></i>
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'score_desc')}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-[12px] text-[13px] font-bold text-slate-600 outline-none cursor-pointer shadow-sm focus:ring-2 focus:ring-indigo-100"
            >
              <option value="score_desc">AI 점수 높은 순</option>
              <option value="newest">최근 지원 순</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsFilterOpen(true)} className={`flex-1 lg:flex-none px-5 py-3.5 font-bold rounded-[16px] border shadow-sm transition-all flex items-center justify-center gap-2 text-[14px] ${filterJob || filterMinScore > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <i className='bx bx-filter-alt text-lg'></i> 상세 필터 {(filterJob || filterMinScore > 0) && <span className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></span>}
            </button>
            <button onClick={openAddModal} className="flex-1 lg:flex-none px-5 py-3.5 bg-slate-900 text-white font-bold rounded-[16px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-[14px]">
              <i className='bx bx-user-plus text-lg'></i> 수동 추가
            </button>
          </div>
        </div>
      </header>

      {/* 💡 Drag and Drop 영역 */}
      <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar flex-1 min-h-0">
        <KanbanColumn
          statusId="applied" title="서류 접수" count={applied.length}
          icon="bx-envelope" colorClass="bg-white text-slate-600"
          candidates={applied} onDropCandidate={handleDropCandidate} viewMode={viewMode}
          onEditCandidate={openEditModal} onDeleteCandidate={(id) => setCandidateToDelete(id)}
          selectedIds={selectedIds} onToggleSelect={toggleSelection}
        />
        <KanbanColumn
          statusId="screening" title="AI 서류 합격" count={screening.length}
          icon="bx-brain" colorClass="bg-blue-500 text-white"
          candidates={screening} onDropCandidate={handleDropCandidate} viewMode={viewMode}
          onEditCandidate={openEditModal} onDeleteCandidate={(id) => setCandidateToDelete(id)}
          selectedIds={selectedIds} onToggleSelect={toggleSelection}
        />
        <KanbanColumn
          statusId="interview" title="심층 면접 (N차)" count={interview.length}
          icon="bx-conversation" colorClass="bg-indigo-500 text-white"
          candidates={interview} onDropCandidate={handleDropCandidate} viewMode={viewMode}
          onEditCandidate={openEditModal} onDeleteCandidate={(id) => setCandidateToDelete(id)}
          selectedIds={selectedIds} onToggleSelect={toggleSelection}
        />
        <KanbanColumn
          statusId="offered" title="최종 합격" count={offered.length}
          icon="bx-party" colorClass="bg-emerald-500 text-white"
          candidates={offered} onDropCandidate={handleDropCandidate} viewMode={viewMode}
          onEditCandidate={openEditModal} onDeleteCandidate={(id) => setCandidateToDelete(id)}
          selectedIds={selectedIds} onToggleSelect={toggleSelection}
        />
        <KanbanColumn
          statusId="rejected" title="불합격" count={rejected.length}
          icon="bx-block" colorClass="bg-red-500 text-white"
          candidates={rejected} onDropCandidate={handleDropCandidate} viewMode={viewMode}
          onEditCandidate={openEditModal} onDeleteCandidate={(id) => setCandidateToDelete(id)}
          selectedIds={selectedIds} onToggleSelect={toggleSelection}
        />
      </div>

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filterJob={filterJob} setFilterJob={setFilterJob} filterMinScore={filterMinScore} setFilterMinScore={setFilterMinScore} onReset={() => { setFilterJob(''); setFilterMinScore(0); }} />
      <CandidateModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} newCandidate={newCandidate} setNewCandidate={setNewCandidate} onSubmit={handleSubmitCandidate} isEditMode={isEditMode} />
      <DeleteConfirmModal isOpen={!!candidateToDelete} onClose={() => setCandidateToDelete(null)} onConfirm={executeDeleteCandidate} />

      {/* 🚀 하단 일괄 처리 액션 바 (Floating Action Bar) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-2xl flex items-center gap-4 sm:gap-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-300 border border-slate-700/50">
          <div className="flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-base shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-inner">{selectedIds.length}</div>
            <span className="whitespace-nowrap hidden sm:block">명 선택됨</span>
          </div>
          <div className="w-px h-6 sm:h-8 bg-slate-700"></div>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar">
            <button onClick={() => handleBulkMove('screening')} className="whitespace-nowrap px-3 sm:px-4 py-2 hover:bg-slate-800 rounded-xl transition-colors text-[13px] sm:text-sm font-bold flex items-center gap-2"><i className='bx bx-brain text-blue-400'></i> AI 서류합격</button>
            <button onClick={() => handleBulkMove('interview')} className="whitespace-nowrap px-3 sm:px-4 py-2 hover:bg-slate-800 rounded-xl transition-colors text-[13px] sm:text-sm font-bold flex items-center gap-2"><i className='bx bx-conversation text-indigo-400'></i> 면접 이동</button>
            <button onClick={() => handleBulkMove('rejected')} className="whitespace-nowrap px-3 sm:px-4 py-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-[13px] sm:text-sm font-bold flex items-center gap-2"><i className='bx bx-block'></i> 일괄 불합격</button>
          </div>
          <div className="w-px h-6 sm:h-8 bg-slate-700"></div>
          <button onClick={() => setSelectedIds([])} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"><i className='bx bx-x text-xl'></i></button>
        </div>
      )}
    </div>
  );
}
