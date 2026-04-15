'use client';

import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { deleteCalendarEvent } from '@/lib/axios';
interface Props {
    selectedDate: Date;
    events: CalendarEvent[];
    onEventEdit: (event: CalendarEvent) => void;
    onEventDelete: (eventId: string) => void;
}

export default function DailySchedule({ selectedDate, events, onEventEdit, onEventDelete }: Props) {
    const dayEvents = events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd'));

    const handleDelete = async (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
        if (confirm('이 면접 일정을 삭제하시겠습니까?')) {
            await deleteCalendarEvent(eventId);
            onEventDelete(eventId);
        }
    };

    return (
        <div className="w-full lg:w-[400px] shrink-0 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl">
                <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Focused Date</p>
                <h3 className="text-[26px] font-black">{format(selectedDate, 'MMMM dd')}</h3>
            </div>

            <div className="space-y-4">
                {dayEvents.map(event => (
                    <div key={event.id} className="group bg-white p-6 rounded-[28px] border border-slate-100 hover:shadow-xl transition-all relative">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[12px] font-black text-slate-400 flex items-center gap-1">
                                <i className='bx bx-time text-lg'></i> {event.startTime} - {event.endTime}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* 수정 버튼 */}
                                <button
                                    onClick={() => onEventEdit(event)}
                                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center transition-colors"
                                >
                                    <i className='bx bx-edit-alt text-lg'></i>
                                </button>
                                {/* 삭제 버튼 */}
                                <button
                                    onClick={(e) => handleDelete(e, event.id!)}
                                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
                                >
                                    <i className='bx bx-trash text-lg'></i>
                                </button>
                            </div>
                        </div>

                        <h4 className="text-[16px] font-black text-slate-800 leading-tight mb-4">{event.title}</h4>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex -space-x-2">
                                {/* 면접자 아바타들... */}
                                <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">
                                    +{event.candidates?.length || 0}
                                </div>
                            </div>
                            <span className="text-[11px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase">Interview</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}