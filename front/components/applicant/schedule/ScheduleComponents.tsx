'use client';

import React from 'react';
import { InterviewEvent } from '@/types/schedule';

// 🧩 1. 다가오는 핵심 면접 카드 (가장 크게 강조됨)
export const HighlightInterviewCard = ({ event }: { event: InterviewEvent }) => {
    if (!event) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 p-8 sm:p-10 rounded-[32px] shadow-2xl relative overflow-hidden group">
            {/* 배경 Boxicon 장식 */}
            <i className='bx bx-calendar-star absolute -right-12 -bottom-12 text-[200px] text-white/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none'></i>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[12px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
                        D-Day
                    </span>
                    <span className="text-indigo-200 font-bold text-[14px]">다음 예정된 일정</span>
                </div>

                <h2 className="text-[28px] sm:text-[36px] font-black text-white mb-2 leading-tight">
                    {event.title}
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mt-8 bg-white/10 backdrop-blur-md p-6 rounded-[24px] border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 text-2xl border border-indigo-400/30">
                            <i className='bx bx-calendar'></i>
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                            <p className="text-[16px] font-black text-white">{event.date}</p>
                        </div>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-white/10"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 text-2xl border border-indigo-400/30">
                            <i className='bx bx-time-five'></i>
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                            <p className="text-[16px] font-black text-white">{event.time}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-white text-indigo-900 py-4 rounded-2xl font-black text-[15px] hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                        <i className={`bx ${event.type === 'ONLINE' ? 'bx-video' : 'bx-map'} text-xl`}></i>
                        {event.type === 'ONLINE' ? '화상 면접장 입장' : '오프라인 약도 보기'}
                    </button>
                    <button className="px-6 py-4 bg-white/10 text-white rounded-2xl font-bold text-[15px] hover:bg-white/20 transition-colors border border-white/10 flex items-center justify-center gap-2">
                        <i className='bx bx-calendar-plus text-xl'></i> 캘린더 추가
                    </button>
                </div>
            </div>
        </div>
    );
};

// 🧩 2. 면접 준비사항 체크리스트 카드
export const PreparationCard = ({ preparations }: { preparations: string[] }) => {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-sm h-full hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl shadow-inner border border-amber-100">
                    <i className='bx bx-list-check'></i>
                </div>
                <h3 className="text-[18px] font-black text-slate-800">사전 준비 사항</h3>
            </div>

            {preparations && preparations.length > 0 ? (
                <ul className="space-y-4">
                    {preparations.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
                                <i className='bx bx-check'></i>
                            </div>
                            <p className="text-[14px] font-bold text-slate-700 leading-relaxed pt-0.5">{item}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 text-slate-400 font-medium">
                    특별한 사전 준비 사항이 없습니다.
                </div>
            )}
        </div>
    );
};

// 🧩 3. 전체 일정 타임라인 리스트
export const ScheduleTimeline = ({ events }: { events: InterviewEvent[] }) => {
    return (
        <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-slate-200/80 shadow-sm">
            <h3 className="text-[20px] font-black text-slate-900 mb-8 flex items-center gap-2">
                <i className='bx bx-history text-indigo-500 text-2xl'></i> 내 일정 히스토리
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {events.map((event, idx) => {
                    const isCompleted = event.status === 'COMPLETED';

                    return (
                        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* 타임라인 중앙 원형 마커 */}
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${isCompleted
                                    ? 'bg-emerald-500 border-emerald-100 text-white'
                                    : 'bg-indigo-600 border-indigo-100 text-white'
                                }`}>
                                <i className={`bx ${isCompleted ? 'bx-check' : 'bx-calendar-event'} text-lg`}></i>
                            </div>

                            {/* 타임라인 카드 */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-[24px] bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {isCompleted ? '완료됨' : '예정됨'}
                                    </span>
                                    <span className="text-[12px] font-bold text-slate-400">{event.date}</span>
                                </div>
                                <h4 className={`text-[16px] font-black mb-1 ${isCompleted ? 'text-slate-500' : 'text-slate-900'}`}>
                                    {event.title}
                                </h4>
                                <p className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5 mt-3">
                                    <i className={`bx ${event.type === 'ONLINE' ? 'bx-video' : 'bx-buildings'}`}></i>
                                    {event.type === 'ONLINE' ? '온라인 (화상)' : '오프라인'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};