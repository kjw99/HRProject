"use client";

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-calendar/dist/Calendar.css';
import { InterviewEvent } from '@/app/hr/calendar/page';

export default function ScheduleBoard({ initialEvents }: { initialEvents: InterviewEvent[] }) {
    const [events, setEvents] = useState<InterviewEvent[]>(initialEvents);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // 모달 상태 관리
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeEvent, setActiveEvent] = useState<InterviewEvent | null>(null);

    // 현재 선택된 날짜의 문자열 (YYYY-MM-DD)
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    // 선택된 날짜의 이벤트 필터링
    const dailyEvents = events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));

    // 캘린더에 이벤트가 있는 날짜 표시용 마커 렌더링
    const tileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const dayEvents = events.filter(e => e.date === formattedDate);
            if (dayEvents.length > 0) {
                return (
                    <div className="flex justify-center gap-1 mt-1">
                        {dayEvents.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        ))}
                    </div>
                );
            }
        }
        return null;
    };

    // 이벤트 삭제 핸들러
    const handleDelete = (id: string) => {
        if (confirm("정말 이 일정을 삭제하시겠습니까?")) {
            setEvents(events.filter(e => e.id !== id));
            setIsDetailOpen(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">

            {/* 📅 좌측: 캘린더 영역 (2/3) */}
            <div className="w-full md:w-2/3 bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-800">Calendar</h2>
                    <button
                        onClick={() => { setActiveEvent(null); setIsFormOpen(true); }}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <i className='bx bx-plus'></i> 일정 추가
                    </button>
                </div>
                <Calendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    tileContent={tileContent}
                    className="custom-calendar"
                    formatDay={(locale, date) => format(date, 'd')} // '일' 글자 제거
                />
            </div>

            {/* 📋 우측: 일간 아젠다 영역 (1/3) */}
            <div className="w-full md:w-1/3 bg-slate-100/50 p-6 rounded-[32px] border border-slate-200">
                <div className="mb-6">
                    <h2 className="text-xl font-black text-slate-900">{format(selectedDate, 'M월 d일')} 일정</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">총 {dailyEvents.length}건의 일정이 있습니다.</p>
                </div>

                <div className="flex flex-col gap-3 h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {dailyEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <i className='bx bx-calendar-x text-5xl mb-2 opacity-30'></i>
                            <span className="font-bold">예정된 일정이 없습니다.</span>
                        </div>
                    ) : (
                        dailyEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={() => { setActiveEvent(event); setIsDetailOpen(true); }}
                                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                        {event.time}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{event.type}</span>
                                </div>
                                <h3 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                <p className="text-xs text-slate-500 font-bold mt-1">지원자: {event.applicantName}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 🔍 모달 1: 상세 정보 및 컨트롤 모달 */}
            <AnimatePresence>
                {isDetailOpen && activeEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-xs font-black">{activeEvent.type}</div>
                                <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-700"><i className='bx bx-x text-2xl'></i></button>
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{activeEvent.title}</h2>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-6">
                                <i className='bx bx-time-five'></i> {activeEvent.date} {activeEvent.time}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                                <div className="text-xs font-black text-slate-400 mb-1 uppercase tracking-widest">지원자</div>
                                <div className="font-bold text-slate-800 mb-4">{activeEvent.applicantName}</div>
                                <div className="text-xs font-black text-slate-400 mb-1 uppercase tracking-widest">상세 내용</div>
                                <div className="text-sm font-medium text-slate-600">{activeEvent.description}</div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setIsDetailOpen(false); setIsFormOpen(true); }} // 수정 모달로 전환
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDelete(activeEvent.id)}
                                    className="flex-1 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition"
                                >
                                    삭제
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ✏️ 모달 2: 추가/수정 폼 모달 (생략된 폼 로직 구현부) */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl z-10">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">{activeEvent ? '일정 수정' : '새 일정 추가'}</h2>
                            {/* 여기에 title, time, applicantName, description을 입력받는 form 태그 구현 (useState 활용) */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center text-slate-500 font-bold mb-6">
                                (추가/수정 폼 입력 필드 영역)
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 bg-slate-100 font-bold rounded-xl">취소</button>
                                <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl">저장</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}