import React, { useState, DragEvent } from 'react';
import { Candidate } from '@/types/hr';

interface CandidateCardProps {
  candidate: Candidate;
  viewMode?: 'detailed' | 'compact';
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidateId: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, viewMode = 'detailed', onEdit, onDelete, isSelected, onToggleSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (score >= 70) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('candidateId', candidate.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { (e.target as HTMLDivElement).classList.add('opacity-40'); }, 0);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.target as HTMLDivElement).classList.remove('opacity-40');
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`rounded-[24px] border shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing group flex flex-col relative z-10 ${viewMode === 'compact' ? 'p-4' : 'p-5'} ${isSelected ? 'bg-indigo-50/40 border-indigo-400 ring-2 ring-indigo-500/20' : 'bg-white border-slate-200/80 hover:border-indigo-300'}`}
    >
      <div className={`flex justify-between items-start pointer-events-none ${viewMode === 'compact' ? 'mb-0' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
          {/* 🚀 일괄 선택용 체크박스 */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleSelect(candidate.id); }}
            className={`w-6 h-6 rounded-[8px] border flex items-center justify-center transition-colors z-20 pointer-events-auto shrink-0 ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm' : 'bg-white border-slate-300 text-transparent hover:border-indigo-400'}`}
          >
            <i className='bx bx-check text-lg'></i>
          </button>

          <div className={`rounded-[14px] bg-slate-100 flex items-center justify-center text-slate-500 font-black border border-slate-200/60 shadow-sm ${viewMode === 'compact' ? 'w-9 h-9 text-base' : 'w-11 h-11 text-lg'}`}>
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h4 className={`font-black text-slate-900 leading-tight ${viewMode === 'compact' ? 'text-[14px]' : 'text-[16px]'}`}>{candidate.name}</h4>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">ID: {candidate.id}</p>
          </div>
        </div>

        {/* 수정/삭제 메뉴 드롭다운 영역 */}
        <div className="relative pointer-events-auto shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 hover:bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center"
          >
            <i className='bx bx-dots-horizontal-rounded text-xl'></i>
          </button>

          {isMenuOpen && (
            <>
              {/* 드롭다운 외부 클릭 시 닫기 위한 보이지 않는 레이어 */}
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>

              {/* 드롭다운 메뉴 컨텐츠 */}
              <div className="absolute right-0 top-10 w-28 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-slate-100 z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(candidate); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <i className='bx bx-edit-alt text-base'></i>수정
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(candidate.id); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <i className='bx bx-trash text-base'></i>삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {viewMode === 'detailed' && (
        <>
          <div className="flex-1 pointer-events-none">
            <p className="text-[13px] text-slate-600 line-clamp-3 leading-relaxed mb-4 font-medium mt-2">
              {candidate.resumeSummary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto pointer-events-none">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <i className='bx bx-time text-sm'></i> 업데이트 2일 전
            </div>
            {candidate.fitScore && (
              <div className={`px-3 py-1.5 rounded-[10px] text-[11px] font-black border flex items-center gap-1.5 shadow-sm ${getScoreColor(candidate.fitScore)}`}>
                <i className='bx bxs-magic-wand'></i> AI Fit {candidate.fitScore}%
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'compact' && candidate.fitScore && (
        <div className="mt-3 flex justify-end pointer-events-none border-t border-slate-50 pt-3">
          <div className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black border flex items-center gap-1 shadow-sm ${getScoreColor(candidate.fitScore)}`}>
            <i className='bx bxs-magic-wand'></i> AI Fit {candidate.fitScore}%
          </div>
        </div>
      )}
    </div>
  );
};


export default CandidateCard;