'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { PassedApplicant } from '@/types/calendar';
import { createCalendarEvent } from '@/lib/axios';

interface Props {
    selectedDate: Date;
    applicants: PassedApplicant[];
    onClose: () => void;
    onSuccess: (event: any) => void;
}

export default function CreateEventModal({ selectedDate, applicants, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('14:00');
    const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);

    const handleSubmit = async () => {
        const newEvent = {
            id: Math.random().toString(),
            title,
            date: format(selectedDate, 'yyyy-MM-dd'),
            startTime,
            type: 'INTERVIEW',
            candidates: applicants.filter(a => selectedApplicants.includes(a.id)),
        };

        await createCalendarEvent(newEvent);
        onSuccess(newEvent);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-[20px] font-black text-slate-900">새 면접 일정 등록</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className='bx bx-x text-3xl'></i></button>
                </div>

                <div className="p-8 space-y-5">
                    {/* 일정 정보 입력 */}
                    <div>
                        <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block">면접명</label>
                        <input
                            type="text"
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold"
                            placeholder="예: 25년 상반기 FE 기술 면접"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block">날짜</label>
                            <div className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-500">{format(selectedDate, 'yyyy-MM-dd')}</div>
                        </div>
                        <div>
                            <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block">시간</label>
                            <input
                                type="time"
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 서류 합격자 선택 리스트 */}
                    <div>
                        <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block">면접 대상자 선택 (서류 합격자 전용)</label>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {applicants.map(app => (
                                <label key={app.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedApplicants.includes(app.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedApplicants.includes(app.id)}
                                            onChange={() => {
                                                setSelectedApplicants(prev =>
                                                    prev.includes(app.id) ? prev.filter(id => id !== app.id) : [...prev, app.id]
                                                );
                                            }}
                                        />
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedApplicants.includes(app.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300'}`}>
                                            {selectedApplicants.includes(app.id) && <i className='bx bx-check text-sm'></i>}
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-700">{app.name} <span className="text-[11px] text-slate-400 font-medium">({app.position})</span></span>
                                    </div>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md font-black">서류합격</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-[15px] hover:bg-black transition-all mt-4"
                    >
                        일정 등록하기
                    </button>
                </div>
            </div>
        </div>
    );
}