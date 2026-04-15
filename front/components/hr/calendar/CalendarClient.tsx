'use client';

import React, { useState } from 'react';
import { CalendarEvent, PassedApplicant } from '@/types/calendar';
import CalendarGrid from './CalendarGrid';
import DailySchedule from './DailySchedule';
import EventFormModal from './EventDetailModal';

export default function CalendarClient({ initialEvents, passedApplicants }: { initialEvents: CalendarEvent[], passedApplicants: PassedApplicant[] }) {
    const [events, setEvents] = useState(initialEvents);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 모달 제어 상태
    const [formModal, setFormModal] = useState<{ isOpen: boolean; mode: 'CREATE' | 'EDIT'; data: CalendarEvent | null }>({
        isOpen: false,
        mode: 'CREATE',
        data: null
    });

    const handleOpenCreate = () => setFormModal({ isOpen: true, mode: 'CREATE', data: null });
    const handleOpenEdit = (event: CalendarEvent) => setFormModal({ isOpen: true, mode: 'EDIT', data: event });
    const handleCloseModal = () => setFormModal({ ...formModal, isOpen: false });

    const handleEventDelete = (eventId: string) => {
        setEvents(events.filter(e => e.id !== eventId));
    };

    const handleFormSuccess = (updatedEvent: CalendarEvent) => {
        if (formModal.mode === 'CREATE') {
            setEvents([...events, updatedEvent]);
        } else {
            setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        }
        handleCloseModal();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end items-center">
                {/* <div>
                    <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Active Pipelines</h2>
                    <p className="text-slate-400 text-sm font-medium">실시간 면접 현황 및 일정 조율</p>
                </div> */}
                <button onClick={handleOpenCreate} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:scale-105 transition-transform flex items-center gap-2">
                    <i className='bx bx-plus-circle text-xl'></i> Add Schedule
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <CalendarGrid events={events} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                <DailySchedule
                    selectedDate={selectedDate}
                    events={events}
                    onEventEdit={handleOpenEdit}
                    onEventDelete={handleEventDelete}
                />
            </div>

            {formModal.isOpen && (
                <EventFormModal
                    mode={formModal.mode}
                    initialData={formModal.data}
                    selectedDate={selectedDate}
                    applicants={passedApplicants}
                    onClose={handleCloseModal}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}