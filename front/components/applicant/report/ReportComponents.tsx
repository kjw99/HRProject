'use client';

import React from 'react';
import { CandidateReport } from '@/types/report';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ==========================================
// 🧩 1. 스켈레톤 로딩 (Boxicons 애니메이션 적용)
// ==========================================
export const ReportSkeleton = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* 상단 스켈레톤 */}
        <div className="h-48 md:h-64 bg-slate-100 rounded-[32px] border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
            <i className='bx bx-loader-alt animate-spin text-5xl text-indigo-300 mb-4'></i>
            <p className="text-slate-500 font-bold text-[15px] animate-pulse">
                AI가 지원자님의 역량을 세밀하게 분석하고 있습니다...
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-[400px] bg-slate-50 rounded-[32px] border border-slate-100 animate-pulse"></div>
            <div className="lg:col-span-2 h-[400px] bg-slate-50 rounded-[32px] border border-slate-100 animate-pulse"></div>
        </div>
    </div>
);

// ==========================================
// 🧩 2. 상단 요약 카드 (Boxicons 워터마크 및 글로우 효과)
// ==========================================
export const ReportSummary = ({ data }: { data: CandidateReport }) => (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 rounded-[32px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">

        {/* 💡 거대한 Boxicon 배경 워터마크 */}
        <i className='bx bxs-report absolute -right-10 -bottom-10 text-[280px] text-white opacity-5 rotate-[-15deg] pointer-events-none'></i>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 backdrop-blur-md text-indigo-200 rounded-xl text-[12px] font-black uppercase tracking-wider mb-5 border border-indigo-400/30">
                    <i className='bx bxs-check-shield text-base text-indigo-400'></i> AI 분석 리포트 발급 완료
                </div>
                <h1 className="text-[28px] md:text-[36px] font-black tracking-tight leading-tight mb-4">
                    <span className="text-indigo-400">{data.applicantName}</span> 님의<br />면접 분석 결과입니다.
                </h1>
                <p className="text-slate-300 font-medium text-[15px] leading-relaxed max-w-2xl bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <i className='bx bxs-quote-left text-indigo-400 mr-2'></i>
                    {data.summary}
                    <i className='bx bxs-quote-right text-indigo-400 ml-2'></i>
                </p>
            </div>

            {/* 💡 총점 써클 (안쪽에 별 아이콘 추가) */}
            <div className="w-32 h-32 rounded-full border-[8px] border-indigo-500/30 flex flex-col items-center justify-center shrink-0 bg-slate-900/80 backdrop-blur-md relative shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="#6366f1" strokeWidth="8" strokeDasharray={`${data.overallScore * 2.89} 289`} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                </svg>
                <div className="absolute top-2 text-indigo-400"><i className='bx bxs-star'></i></div>
                <span className="text-[36px] font-black text-white leading-none mt-2">{data.overallScore}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Score</span>
            </div>
        </div>
    </div>
);

// ==========================================
// 🧩 3. 역량 레이더 차트 (아이콘 강조 헤더)
// ==========================================
export const CompetencyRadarChart = ({ competencies }: { competencies: CandidateReport['competencies'] }) => {
    const chartData = {
        labels: competencies.map(c => c.label),
        datasets: [{
            label: '나의 역량 지수',
            data: competencies.map(c => c.score),
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            pointBorderColor: '#fff',
        }],
    };

    const chartOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(203, 213, 225, 0.5)' },
                grid: { color: 'rgba(203, 213, 225, 0.5)' },
                pointLabels: { font: { size: 12, weight: 'bold' as const }, color: '#64748b' },
                ticks: { display: false, min: 0, max: 100 },
            },
        },
        plugins: { legend: { display: false } },
        maintainAspectRatio: false,
    };

    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-inner border border-indigo-100">
                    <i className='bx bx-radar'></i>
                </div>
                <h3 className="text-[17px] font-black text-slate-800">종합 역량 밸런스</h3>
            </div>
            <div className="flex-1 min-h-[250px] relative">
                <Radar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

// ==========================================
// 🧩 4. 강점 및 보완점 카드 (Boxicons 리스트 스타일링)
// ==========================================
export const StrengthWeakness = ({ strengths, weaknesses }: { strengths: string[], weaknesses: string[] }) => (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full flex flex-col gap-8 hover:shadow-lg transition-shadow">

        {/* 강점 섹션 */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                    <i className='bx bx-trending-up'></i>
                </div>
                <h3 className="text-[16px] font-black text-slate-800">주요 강점 <span className="text-emerald-500 font-bold text-sm ml-1">Strengths</span></h3>
            </div>
            <ul className="space-y-3">
                {strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-emerald-50/50 p-4 rounded-[20px] border border-emerald-100 hover:bg-emerald-50 transition-colors">
                        {/* 💡 체크 아이콘 강조 */}
                        <div className="bg-white rounded-full p-1 shadow-sm shrink-0 border border-emerald-200 mt-0.5">
                            <i className='bx bx-check text-emerald-500 text-base font-black'></i>
                        </div>
                        <span className="text-[14px] font-bold text-slate-700 leading-relaxed pt-0.5">{str}</span>
                    </li>
                ))}
            </ul>
        </div>

        {/* 보완점 섹션 */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl">
                    <i className='bx bx-trending-down'></i>
                </div>
                <h3 className="text-[16px] font-black text-slate-800">보완 포인트 <span className="text-rose-500 font-bold text-sm ml-1">Improvements</span></h3>
            </div>
            <ul className="space-y-3">
                {weaknesses.map((wk, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-rose-50/50 p-4 rounded-[20px] border border-rose-100 hover:bg-rose-50 transition-colors">
                        {/* 💡 타겟/에러 아이콘 강조 */}
                        <div className="bg-white rounded-full p-1 shadow-sm shrink-0 border border-rose-200 mt-0.5">
                            <i className='bx bx-target-lock text-rose-500 text-base font-black'></i>
                        </div>
                        <span className="text-[14px] font-bold text-slate-700 leading-relaxed pt-0.5">{wk}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

// ==========================================
// 🧩 5. 문항별 상세 피드백 리스트 (말풍선 및 봇 아이콘 활용)
// ==========================================
export const DetailedFeedback = ({ feedbacks }: { feedbacks: CandidateReport['feedbacks'] }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-12 h-12 rounded-[16px] bg-slate-900 text-white flex items-center justify-center text-2xl shadow-lg">
                <i className='bx bx-message-square-detail'></i>
            </div>
            <div>
                <h3 className="text-[20px] font-black text-slate-900">문항별 상세 분석</h3>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">답변 내역과 AI 면접관의 코멘트를 확인하세요.</p>
            </div>
        </div>

        {feedbacks.map((fb, idx) => (
            <div key={fb.id} className="bg-white rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-lg transition-shadow duration-300">

                {/* 질문 헤더 영역 */}
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <span className="w-10 h-10 rounded-[14px] bg-white border border-slate-200 text-slate-400 font-black flex items-center justify-center shrink-0 shadow-sm text-lg">
                            Q{idx + 1}
                        </span>
                        <p className="text-[16px] font-black text-slate-800 pt-2 leading-snug">{fb.question}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-black uppercase tracking-wider shrink-0 border shadow-sm ${fb.rating === 'Excellent' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            fb.rating === 'Good' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                        <i className={`bx ${fb.rating === 'Excellent' ? 'bxs-star' : fb.rating === 'Good' ? 'bx-check-shield' : 'bx-error'}`}></i>
                        {fb.rating}
                    </span>
                </div>

                {/* 답변 및 코멘트 영역 */}
                <div className="p-6 md:p-8 space-y-6">

                    {/* 💡 유저 답변 아이콘 처리 */}
                    <div className="relative pl-6 border-l-2 border-slate-200">
                        <i className='bx bxs-user-circle absolute -left-3.5 top-0 text-3xl text-slate-300 bg-white'></i>
                        <span className="text-[12px] font-black text-slate-400 mb-2 block uppercase tracking-wider pl-4">나의 답변 요약</span>
                        <div className="bg-slate-50 p-5 rounded-[24px] rounded-tl-none border border-slate-100 ml-4">
                            <p className="text-[15px] font-medium text-slate-700 leading-relaxed">{fb.myAnswerSummary}</p>
                        </div>
                    </div>

                    {/* 💡 AI 피드백 아이콘 처리 */}
                    <div className="relative pl-6 border-l-2 border-indigo-200">
                        <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center border-4 border-white shadow-sm">
                            <i className='bx bx-bot text-white text-lg'></i>
                        </div>
                        <span className="text-[12px] font-black text-indigo-500 mb-2 block uppercase tracking-wider pl-4">AI 피드백 코멘트</span>
                        <div className="bg-indigo-50/50 p-5 rounded-[24px] rounded-tl-none border border-indigo-100 ml-4 shadow-sm">
                            <p className="text-[15px] font-bold text-slate-800 leading-relaxed">{fb.aiComment}</p>
                        </div>
                    </div>

                </div>
            </div>
        ))}
    </div>
);