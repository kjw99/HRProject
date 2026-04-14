'use client';

import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface ChartData {
    day: string;
    tokens: number;
    calls: number;
}

// 🎨 Recharts 커스텀 툴팁 (마우스 Hover 시 나타나는 고급스러운 정보창)
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-md p-4 rounded-[16px] shadow-2xl border border-slate-700">
                <p className="text-slate-400 text-[12px] font-bold mb-1">{label}요일 데이터</p>
                <p className="text-indigo-400 text-[18px] font-black tracking-tight">
                    {payload[0].value} <span className="text-[12px] font-medium text-slate-300">Million Tokens</span>
                </p>
                <div className="h-px w-full bg-slate-700 my-2"></div>
                <p className="text-slate-300 text-[12px] font-medium flex justify-between gap-4">
                    <span>API 호출 수:</span>
                    <span className="font-bold text-white">{payload[0].payload.calls.toLocaleString()} 건</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function UsageChart({ initialData }: { initialData: ChartData[] }) {
    // 탭 변경 상태
    const [timeRange, setTimeRange] = useState('7d');
    // 막대그래프 Hover 시 색상 변경을 위한 상태
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-[450px]">

            {/* 차트 상단 컨트롤러 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-[18px] font-black text-slate-900">주간 토큰 소모량 트렌드</h2>
                    <p className="text-[13px] text-slate-500 font-medium mt-1">단위: 백만(Million) 토큰</p>
                </div>

                <div className="flex gap-2 bg-slate-50 p-1 rounded-[12px] border border-slate-200 shadow-sm">
                    {['7d', '30d', 'all'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${timeRange === range
                                ? 'bg-indigo-500 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                        >
                            {range === '7d' ? '최근 7일' : range === '30d' ? '최근 30일' : '전체'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🚀 Recharts 막대 차트 영역 */}
            <div className="flex-1 w-full h-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={initialData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        barSize={48}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(value) => `${value}M`}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: '#f8fafc', rx: 12 }} // 호버 시 배경 가이드라인
                        />
                        <Bar
                            dataKey="tokens"
                            radius={[12, 12, 12, 12]} // 막대 끝을 둥글게 (Rounded Corners)
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {initialData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    // 마우스 Hover 시 색상 활성화 로직
                                    fill={activeIndex === index ? '#4f46e5' : '#818cf8'}
                                    className="transition-all duration-300"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}