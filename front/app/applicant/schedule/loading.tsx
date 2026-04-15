import React from 'react';

export default function ScheduleLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* 헤더 스켈레톤 */}
            <div className="h-16 w-64 bg-slate-200 rounded-2xl"></div>

            {/* 메인 그리드 스켈레톤 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-[350px] bg-slate-200 rounded-[32px] border border-slate-100"></div>
                <div className="lg:col-span-1 h-[350px] bg-slate-200 rounded-[32px] border border-slate-100"></div>
            </div>

            <div className="h-px w-full bg-slate-200/60 my-4"></div>

            {/* 타임라인 스켈레톤 */}
            <div className="h-[400px] bg-slate-200 rounded-[32px] border border-slate-100"></div>
        </div>
    );
}