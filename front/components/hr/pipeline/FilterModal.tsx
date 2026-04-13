interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterJob: string;
  setFilterJob: (val: string) => void;
  filterMinScore: number;
  setFilterMinScore: (val: number) => void;
  onReset: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filterJob,
  setFilterJob,
  filterMinScore,
  setFilterMinScore,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <i className="bx bx-filter-alt text-indigo-500"></i> 상세 필터
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <i className="bx bx-x text-xl"></i>
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-[13px] font-black text-slate-700 mb-3 uppercase tracking-widest">
              지원 직무
            </label>
            <div className="relative">
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              >
                <option value="">모든 직무 보기</option>
                <option value="job_1">프론트엔드 리드 개발자</option>
                <option value="job_2">AI 에이전트 엔지니어</option>
              </select>
              <i className="bx bx-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-2xl pointer-events-none"></i>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-black text-slate-700 mb-3 uppercase tracking-widest flex justify-between items-center">
              <span>AI 적합도 (Fit Score)</span>
              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {filterMinScore}점 이상
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
          <button
            onClick={onReset}
            className="px-6 py-4 rounded-[16px] font-bold text-slate-500 hover:bg-slate-200 transition-colors"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-[16px] font-black hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;