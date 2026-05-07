import React from 'react';
import Link from 'next/link';

// 💡 타입 정의
export interface Q1Data {
    todayIntervieweeCount: number;
    todayHiringTeamCount: number;
}

export interface Q2Data {
    totalApplicants: number;
    activeJobs: number;
}

export function Q1Summary({ data }: { data: Q1Data }) {
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {/* 1사분면-좌: 면접자 수 (클릭 시 이동) */}
            <Link href="/hr/schedule" className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i className="bx bx-user-voice text-2xl"></i>
                </div>
                <div>
                    <h3 className="text-slate-500 text-sm font-bold mb-1">금일 면접자 수</h3>
                    <p className="text-3xl font-black text-slate-800 flex items-center gap-2">
                        {data.todayIntervieweeCount}<span className="text-base font-bold text-slate-400">명</span>
                        <i className="bx bx-right-arrow-alt text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"></i>
                    </p>
                </div>
            </Link>

            {/* 1사분면-우: 팀 수 */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <i className="bx bx-group text-2xl"></i>
                </div>
                <div>
                    <h3 className="text-slate-500 text-sm font-bold mb-1">참여 채용 부서</h3>
                    <p className="text-3xl font-black text-slate-800">{data.todayHiringTeamCount}<span className="text-base font-bold text-slate-400 ml-1">팀</span></p>
                </div>
            </div>
        </div>
    );
}

export function Q2Summary({ data }: { data: Q2Data }) {
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {/* 2사분면-좌: 총 지원자 */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                    <i className="bx bx-id-card text-2xl"></i>
                </div>
                <div>
                    <h3 className="text-slate-500 text-sm font-bold mb-1">총 지원자 수</h3>
                    <p className="text-3xl font-black text-slate-800">{data.totalApplicants.toLocaleString()}<span className="text-base font-bold text-slate-400 ml-1">명</span></p>
                </div>
            </div>

            {/* 2사분면-우: 진행 직무 */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                    <i className="bx bx-briefcase text-2xl"></i>
                </div>
                <div>
                    <h3 className="text-slate-500 text-sm font-bold mb-1">진행 중인 직무</h3>
                    <p className="text-3xl font-black text-slate-800">{data.activeJobs}<span className="text-base font-bold text-slate-400 ml-1">개</span></p>
                </div>
            </div>
        </div>
    );
}