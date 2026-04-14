"use client";

import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// ChartJS 플러그인 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ChartData {
  day: string;
  tokens: number;
  calls: number;
}

interface UsageChartProps {
  initialData: ChartData[];
}

export default function UsageChart({ initialData }: UsageChartProps) {
  const [timeRange, setTimeRange] = useState("7d");

  // 데이터 동적 변경 로직 (기존과 동일)
  const chartData = useMemo(() => {
    if (timeRange === "30d") {
      return initialData.map((d) => ({
        ...d,
        tokens: Number((d.tokens * 1.5).toFixed(1)),
        calls: d.calls + 5000,
      }));
    } else if (timeRange === "all") {
      return initialData.map((d) => ({
        ...d,
        tokens: Number((d.tokens * 2.2).toFixed(1)),
        calls: d.calls + 12000,
      }));
    }
    return initialData;
  }, [timeRange, initialData]);

  // Chart.js 데이터 설정
  const data = {
    labels: chartData.map((d) => d.day),
    datasets: [
      {
        label: "Tokens (Million)",
        data: chartData.map((d) => d.tokens),
        backgroundColor: "#6366f1", // indigo-500
        hoverBackgroundColor: "#4f46e5", // indigo-600
        borderRadius: 8, // 막대 모서리 둥글게
        barThickness: 48, // 막대 두께
      },
    ],
  };

  // Chart.js 옵션 설정 (그리드 제거 및 툴팁 커스텀)
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false, // 부모 컨테이너(flex)에 높이를 맞추기 위해 필수!
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // 상단 범례 숨김
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)", // slate-900 반투명
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 14, weight: "bold" },
        padding: 12,
        cornerRadius: 12,
        displayColors: false, // 툴팁 내 컬러 박스 숨김
        callbacks: {
          title: (context) => `${context[0].label}요일 데이터`,
          label: (context) => {
            const index = context.dataIndex;
            const currentData = chartData[index];
            // 배열을 반환하면 툴팁 내에서 줄바꿈이 됩니다.
            return [
              `${currentData.tokens} Million Tokens`,
              `API 호출 수: ${currentData.calls.toLocaleString()} 건`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false, // 💡 drawBorder: false 대신 border.display를 사용합니다.
        },
        ticks: {
          font: { size: 13, weight: "bold" },
          color: "#64748b",
        },
      },
      y: {
        grid: {
          color: "#f1f5f9", // 연한 가이드라인
        },
        border: {
          display: false, // 💡 축의 메인 실선 숨기기
          dash: [4, 4], // 점선 처리
        },
        ticks: {
          font: { size: 11, weight: "bold" },
          color: "#94a3b8",
          callback: (value) => `${value}M`, // Y축 값에 M 붙이기
        },
      },
    },
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-[450px]">
      {/* 차트 상단 컨트롤러 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-[18px] font-black text-slate-900">
            주간 토큰 소모량 트렌드
          </h2>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            단위: 백만(Million) 토큰
          </p>
        </div>

        <div className="flex gap-2 bg-slate-50 p-1 rounded-[12px] border border-slate-200 shadow-sm">
          {["7d", "30d", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${
                timeRange === range
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {range === "7d"
                ? "최근 7일"
                : range === "30d"
                  ? "최근 30일"
                  : "전체"}
            </button>
          ))}
        </div>
      </div>

      {/* 🚀 Chart.js 렌더링 영역 */}
      <div className="flex-1 w-full min-h-[250px] relative">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
