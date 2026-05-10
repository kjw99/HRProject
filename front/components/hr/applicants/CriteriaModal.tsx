'use client';

import { Applicant } from '@/types/applicant';

interface CriteriaModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicant: Applicant | null;
}

export default function CriteriaModal({ isOpen, onClose, applicant }: CriteriaModalProps) {
    if (!isOpen || !applicant) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                            <i className="bx bx-award text-xl"></i>
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-800">
                                우대조건 충족 내역
                            </h2>
                            <p className="text-xs text-slate-500 font-bold mt-0.5">
                                {applicant.name} 지원자
                            </p>
                        </div>
                    </div>
                </div>

                {/* 본문 (자격증 목록) */}
                <div className="p-6 bg-white">
                    <ul className="space-y-3">
                        {applicant.preferredCriteria.map((criteria, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-4 border border-emerald-100 bg-emerald-50/30 rounded-2xl">
                                <i className="bx bxs-check-circle text-emerald-500 text-lg mt-0.5"></i>
                                <span className="text-sm font-bold text-slate-700 leading-snug">
                                    {criteria}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 푸터 */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors w-full"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}