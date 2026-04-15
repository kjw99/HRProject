'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEvent, PassedApplicant } from '@/types/calendar';

interface Props {
    mode: 'CREATE' | 'EDIT';
    initialData: CalendarEvent | null; // 수정 시 기존 데이터
    selectedDate: Date;
    applicants: PassedApplicant[];
    onClose: () => void;
    onSuccess: (event: CalendarEvent) => void;
}

export default function EventFormModal({ mode, initialData, selectedDate, applicants, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [startTime, setStartTime] = useState(initialData?.startTime || '14:00');
    const [endTime, setEndTime] = useState(initialData?.endTime || '15:00');
    const [selectedApplicants, setSelectedApplicants] = useState<string[]>(
        initialData?.candidates?.map(candidate => candidate.id) || []
    );

    const handleSubmit = async () => {
        const eventData = {
            id: initialData?.id || Math.random().toString(),
            title,
            date: format(selectedDate, 'yyyy-MM-dd'),
            startTime,
            endTime,
            type: 'INTERVIEW',
            candidates: applicants.filter(a => selectedApplicants.includes(a.id)),
        };

        // API 호출 후 성공 시 상위 상태 업데이트
        onSuccess(eventData as any);
    };

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-[20px] font-black text-slate-900">
                        {mode === 'CREATE' ? '새 일정 등록' : '일정 수정'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className='bx bx-x text-3xl'></i></button>
                </div>

                <div className="p-8 space-y-5">
                    <div>
                        <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Interview Title</label>
                        <input
                            type="text"
                            className="w-full p-4 bg-slate-50 border text-slate-700 border-slate-100 rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold"
                            placeholder="예: 백엔드 1차 기술 면접"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Start Time</label>
                            <input
                                type="time"
                                className="w-full p-4 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl outline-none font-bold"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">End Time</label>
                            <input
                                type="time"
                                className="w-full p-4 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl outline-none font-bold"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Select Candidates</label>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {applicants.map(app => (
                                <label key={app.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedApplicants.includes(app.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedApplicants.includes(app.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300'}`}>
                                            {selectedApplicants.includes(app.id) && <i className='bx bx-check text-sm'></i>}
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-700">{app.name}</span>
                                    </div>
                                    <span className="text-[10px] bg-white text-slate-400 px-2 py-1 rounded-md border border-slate-100 font-bold">{app.position}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-indigo-600 text-white rounded-[22px] font-black text-[15px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4"
                    >
                        {mode === 'CREATE' ? '일정 저장하기' : '수정 완료'}
                    </button>
                </div>
            </div>
        </div>
    );
}