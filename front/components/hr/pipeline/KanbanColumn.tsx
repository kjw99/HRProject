"use client";
import { Candidate } from "@/types/hr";
import { useState, DragEvent } from "react";
import CandidateCard from "./CandidateCard";

interface KanbanColumnProps {
  statusId: string;
  title: string;
  count: number;
  icon: string;
  colorClass: string;
  candidates: Candidate[];
  onDropCandidate: (candidateId: string, newStatus: string) => void;
  viewMode?: 'detailed' | 'compact';
  onEditCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidateId: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  statusId, title, count, icon, colorClass, candidates, onDropCandidate, viewMode = 'detailed', onEditCandidate, onDeleteCandidate, selectedIds, onToggleSelect
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => { setIsDragOver(false); };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const candidateId = e.dataTransfer.getData('candidateId');
    if (candidateId) {
      onDropCandidate(candidateId, statusId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-[32px] border p-5 h-full min-h-[600px] min-w-[320px] lg:min-w-0 flex-1 snap-center shrink-0 transition-all duration-300 ${isDragOver
        ? 'bg-indigo-50/60 border-indigo-300 shadow-inner scale-[1.02]'
        : 'bg-slate-50/70 border-slate-200/80'
        }`}
    >
      <div className="flex items-center justify-between mb-6 px-2 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 ${colorClass}`}>
            <i className={`bx ${icon} text-[22px]`}></i>
          </div>
          <h3 className="font-black text-slate-800 text-[17px] tracking-tight">{title}</h3>
        </div>
        <span className="bg-white px-3 py-1 rounded-[10px] text-[13px] font-black text-slate-500 border border-slate-200 shadow-sm">
          {count}
        </span>
      </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden px-1 pb-4 styled-scrollbar ${viewMode === 'compact' ? 'space-y-2.5' : 'space-y-4'}`}>
        {candidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            viewMode={viewMode}
            onEdit={onEditCandidate}
            onDelete={onDeleteCandidate}
            isSelected={selectedIds.includes(candidate.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}

        {candidates.length === 0 && (
          <div className={`h-32 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center gap-2 transition-colors ${isDragOver ? 'border-indigo-400 text-indigo-500 bg-indigo-100/50' : 'border-slate-200 text-slate-400 bg-white/50'}`}>
            <i className={`bx ${isDragOver ? 'bx-import animate-bounce' : 'bx-ghost'} text-2xl`}></i>
            <span className="text-[13px] font-bold">{isDragOver ? '여기로 이동' : '지원자 없음'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;