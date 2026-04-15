'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';

interface Props {
    events: CalendarEvent[];
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
}

export default function CalendarGrid({ events, onDateSelect, selectedDate }: Props) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const renderHeader = () => (
        <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-[24px] font-black text-slate-900 tracking-tighter">
                {format(currentMonth, 'yyyy년 M월')}
            </h2>
            <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <i className='bx bx-chevron-left text-2xl text-slate-400'></i>
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <i className='bx bx-chevron-right text-2xl text-slate-400'></i>
                </button>
            </div>
        </div>
    );

    const renderDays = () => {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map(day => (
                    <div key={day} className="text-center text-[11px] font-black text-slate-400 tracking-widest">{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, 'yyyy-MM-dd');
                const dayEvents = events.filter(e => e.date === formattedDate);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                const cloneDay = day;
                days.push(
                    <div
                        key={day.toString()}
                        onClick={() => onDateSelect(cloneDay)}
                        className={`min-h-[100px] p-2 border-t border-slate-100 cursor-pointer transition-all hover:bg-slate-50/50 ${isSelected ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-200' : ''
                            } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                    >
                        <span className={`text-[13px] font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                            {format(day, 'd')}
                        </span>
                        <div className="mt-2 space-y-1">
                            {dayEvents.slice(0, 3).map(event => (
                                <div key={event.id} className={`text-[10px] p-1 rounded-md font-bold truncate ${event.type === 'CODING_TEST' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                    }`}>
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 3 && <p className="text-[9px] text-slate-400 font-bold ml-1">+{dayEvents.length - 3} more</p>}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
            days = [];
        }
        return <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">{rows}</div>;
    };

    return (
        <div className="flex-1">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}