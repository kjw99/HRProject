"use client";
import { useState } from "react";

const CandidateModal = ({ isOpen, onClose, newCandidate, setNewCandidate, onSubmit, isEditMode }: any) => {
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!newCandidate.name || !newCandidate.appliedJob) {
            setError('이름과 지원 직무를 모두 입력해주세요.');
            return;
        }
        setError('');
        onSubmit();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        {isEditMode ? <><i className='bx bx-edit-alt text-indigo-500'></i> 지원자 정보 수정</> : <><i className='bx bx-user-plus text-emerald-500'></i> 지원자 수동 추가</>}
                    </h3>
                    <button onClick={() => { setError(''); onClose(); }} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><i className='bx bx-x text-xl'></i></button>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-[13px] font-bold p-3 rounded-xl flex items-center gap-2">
                            <i className='bx bx-error-circle text-lg'></i> {error}
                        </div>
                    )}
                    <input type="text" placeholder="이름 (예: 홍길동)" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold outline-none focus:ring-2 focus:ring-indigo-100" />
                    <select value={newCandidate.appliedJob} onChange={(e) => setNewCandidate({ ...newCandidate, appliedJob: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold outline-none focus:ring-2 focus:ring-indigo-100">
                        <option value="" disabled>직무 선택</option>
                        <option value="job_1">프론트엔드 리드 개발자</option>
                        <option value="job_2">AI 에이전트 엔지니어</option>
                    </select>
                    <textarea placeholder="이력서 핵심 요약..." value={newCandidate.resumeSummary} onChange={(e) => setNewCandidate({ ...newCandidate, resumeSummary: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium outline-none resize-none h-32 focus:ring-2 focus:ring-indigo-100"></textarea>
                </div>
                <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                    <button onClick={() => { setError(''); onClose(); }} className="px-6 py-4 rounded-[16px] font-bold text-slate-500 hover:bg-slate-200">취소</button>
                    <button onClick={handleSubmit} className="flex-1 py-4 bg-slate-900 text-white rounded-[16px] font-black hover:bg-slate-800 flex items-center justify-center gap-2 shadow-md">
                        {isEditMode ? <><i className='bx bx-check'></i> 수정 완료</> : <><i className='bx bx-plus'></i> 파이프라인에 추가</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default CandidateModal;  