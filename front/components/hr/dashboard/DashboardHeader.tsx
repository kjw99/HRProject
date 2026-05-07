'use client';

import React, { useState } from 'react';

export default function DashboardHeader() {
    const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">채용 대시보드</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    현재 진행 중인 채용 파이프라인과 면접 일정을 한눈에 확인하세요.
                </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
                <button
                    onClick={() => setIsApplicantModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-sm font-bold shadow-sm transition-all"
                >
                    <i className="bx bx-list-ul text-lg"></i> 지원자 리스트
                </button>
                <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
                >
                    <i className="bx bx-calendar-plus text-lg"></i> 면접 일정 생성
                </button>
            </div>

            {/* 💡 임시 모달 렌더링 */}
            {isApplicantModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-[24px] shadow-xl w-full max-w-md relative animate-in fade-in zoom-in-95">
                        <button onClick={() => setIsApplicantModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><i className="bx bx-x text-2xl"></i></button>
                        <h2 className="font-black text-lg text-slate-800 mb-4">지원자 리스트</h2>
                        <p className="text-slate-500 text-sm">여기에 지원자 리스트 컴포넌트가 들어갑니다.</p>
                    </div>
                </div>
            )}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-[24px] shadow-xl w-full max-w-md relative animate-in fade-in zoom-in-95">
                        <button onClick={() => setIsScheduleModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><i className="bx bx-x text-2xl"></i></button>
                        <h2 className="font-black text-lg text-slate-800 mb-4">면접 일정 생성</h2>
                        <p className="text-slate-500 text-sm">여기에 폼이 들어갑니다.</p>
                    </div>
                </div>
            )}
        </div>
    );
}