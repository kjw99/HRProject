import React from 'react';

// 💡 타입 정의
export type InterviewStatus = '응시 전' | '응시 중' | '응시 완료';

export interface TodayInterview {
    id: string;
    time: string;
    applicant: string;
    job: string;
    round: string; // n차 면접
    status: InterviewStatus;
}

export default function Q3TodayInterviews({ data }: { data: TodayInterview[] }) {
    const getStatusBadge = (status: InterviewStatus) => {
        switch (status) {
            case '응시 전': return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">응시 전</span>;
            case '응시 중': return <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold animate-pulse">응시 중</span>;
            case '응시 완료': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold">응시 완료</span>;
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <i className="bx bx-calendar-star text-indigo-500"></i> 오늘 면접 일정
                </h2>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">시간</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">지원자</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">직무</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">회차</th>
                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">상태</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-mono font-bold text-slate-800 whitespace-nowrap">{item.time}</td>
                                <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">{item.applicant}</td>
                                <td className="px-5 py-4 text-sm font-medium text-slate-600">{item.job}</td>
                                <td className="px-5 py-4 text-sm font-bold text-slate-500 whitespace-nowrap">{item.round}</td>
                                <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm font-medium">오늘 예정된 면접이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}