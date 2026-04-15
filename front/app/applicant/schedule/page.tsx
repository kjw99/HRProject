import React from 'react';
import {
    HighlightInterviewCard,
    PreparationCard,
    ScheduleTimeline
} from '@/components/applicant/schedule/ScheduleComponents';
import { fetchScheduleData } from '@/lib/axios';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '면접 일정 | A-RECRUIT',
};

export default async function ApplicantSchedulePage() {
    // 💡 서버에서 데이터를 Fetching 합니다.
    const scheduleData = await fetchScheduleData();

    // 가장 가까운(UPCOMING) 면접 일정 찾기
    const upcomingEvent = scheduleData.events.find(e => e.status === 'UPCOMING');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 🟢 헤더 영역 */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-[28px] md:text-[32px] font-black tracking-tight text-slate-900">
                        면접 일정
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {scheduleData.applicantName} 님의 향후 일정을 확인하고 준비하세요.
                    </p>
                </div>
                {scheduleData.upcomingCount > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[14px]">
                        <i className='bx bx-bell animate-tada'></i>
                        예정된 면접 {scheduleData.upcomingCount}건
                    </div>
                )}
            </header>

            {/* 🟢 메인 그리드 영역 (가장 임박한 일정 강조) */}
            {upcomingEvent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <HighlightInterviewCard event={upcomingEvent} />
                    </div>
                    <div className="lg:col-span-1">
                        <PreparationCard preparations={upcomingEvent.preparation || []} />
                    </div>
                </div>
            )}

            <div className="h-px w-full bg-slate-200/60 my-4"></div>

            {/* 🟢 전체 타임라인 영역 */}
            <section>
                <ScheduleTimeline events={scheduleData.events} />
            </section>

        </div>
    );
}