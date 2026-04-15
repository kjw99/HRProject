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

const AddCandidateModal = ({ isOpen, onClose, newCandidate, setNewCandidate, onSubmit }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><i className='bx bx-user-plus text-emerald-500'></i> 지원자 추가</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><i className='bx bx-x text-xl'></i></button>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <input type="text" placeholder="이름 (예: 홍길동)" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold outline-none" />
          <select value={newCandidate.appliedJob} onChange={(e) => setNewCandidate({ ...newCandidate, appliedJob: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold outline-none">
            <option value="" disabled>직무 선택</option>
            <option value="job_1">프론트엔드 리드 개발자</option>
            <option value="job_2">AI 에이전트 엔지니어</option>
          </select>
          <textarea placeholder="이력서 핵심 요약..." value={newCandidate.resumeSummary} onChange={(e) => setNewCandidate({ ...newCandidate, resumeSummary: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium outline-none resize-none h-32"></textarea>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
          <button onClick={onClose} className="px-6 py-4 rounded-[16px] font-bold text-slate-500 hover:bg-slate-200">취소</button>
          <button onClick={onSubmit} className="flex-1 py-4 bg-slate-900 text-white rounded-[16px] font-black hover:bg-slate-800"><i className='bx bx-check'></i> 추가</button>
        </div>
      </div>
    </div>
  );
};


export default AddCandidateModal;