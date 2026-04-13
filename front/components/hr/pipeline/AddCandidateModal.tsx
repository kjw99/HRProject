interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCandidate: { name: string; appliedJob: string; resumeSummary: string };
  setNewCandidate: (val: {
    name: string;
    appliedJob: string;
    resumeSummary: string;
  }) => void;
  onSubmit: () => void;
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  newCandidate,
  setNewCandidate,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <i className="bx bx-user-plus text-emerald-500"></i> 지원자 수동
            추가
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <i className="bx bx-x text-xl"></i>
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[60vh]">
          <div>
            <label className="block text-[13px] font-black text-slate-700 mb-3 uppercase tracking-widest">
              지원자 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 홍길동"
              value={newCandidate.name}
              onChange={(e) =>
                setNewCandidate({ ...newCandidate, name: e.target.value })
              }
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-black text-slate-700 mb-3 uppercase tracking-widest">
              지원 직무 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={newCandidate.appliedJob}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    appliedJob: e.target.value,
                  })
                }
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all"
              >
                <option value="" disabled>
                  직무를 선택하세요
                </option>
                <option value="job_1">프론트엔드 리드 개발자</option>
                <option value="job_2">AI 에이전트 엔지니어</option>
              </select>
              <i className="bx bx-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-2xl pointer-events-none"></i>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-black text-slate-700 mb-3 uppercase tracking-widest">
              이력서 핵심 요약
            </label>
            <textarea
              placeholder="지원자의 핵심 역량이나 주요 경력을 간단히 요약해주세요."
              value={newCandidate.resumeSummary}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  resumeSummary: e.target.value,
                })
              }
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-700 h-32 resize-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
            ></textarea>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <i className="bx bx-check"></i> 파이프라인에 추가
          </button>
        </div>
      </div>
    </div>
  );
};


export default AddCandidateModal;