import StatCards from "@/components/admin/dashboard/StatCards";
import SystemLogs from "@/components/admin/dashboard/SystemLogs";
import UsageChart from "@/components/admin/dashboard/UsageChart";
import React from "react";

// 서버 사이드에서 데이터를 Fetching 한다고 가정합니다.
const fetchDashboardData = async () => {
  // 실제로는 await db.query(...) 가 들어갑니다.
  return {
    metrics: {
      apiCalls: {
        value: "234,512",
        change: "+12.5%",
        isUp: true,
        label: "총 API 호출 수",
      },
      tokenUsage: {
        value: "45.2M",
        change: "+8.2%",
        isUp: true,
        label: "소모 토큰 (Tokens)",
      },
      estimatedCost: {
        value: "$1,240",
        change: "-2.4%",
        isUp: false,
        label: "이달 예상 청구액",
      },
      errorRate: {
        value: "0.12%",
        change: "-0.05%",
        isUp: false,
        label: "시스템 에러율",
      },
    },
    weeklyData: [
      { day: "월", tokens: 4.2, calls: 21000 },
      { day: "화", tokens: 5.8, calls: 28000 },
      { day: "수", tokens: 8.4, calls: 42000 },
      { day: "목", tokens: 7.1, calls: 36000 },
      { day: "금", tokens: 9.2, calls: 48000 },
      { day: "토", tokens: 2.1, calls: 11000 },
      { day: "일", tokens: 1.8, calls: 9000 },
    ],
    logs: Array.from({ length: 20 }).map((_, i) => ({
      id: `LOG-00${i + 1}`,
      type: i % 4 === 0 ? "error" : i % 3 === 0 ? "warning" : "info",
      message: `테스트용 시스템 로그 메시지입니다. (Index: ${i + 1})`,
      time: `${i + 1}분 전`,
      user: "system",
    })),
  };
};

export default async function AdminDashboardPage() {
  const data = await fetchDashboardData();

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 animate-in fade-in duration-700 sm:space-y-8">
      {/* 아이콘 로드를 위한 CDN (실제 프로덕션에서는 npm 패키지 설치 권장) */}

      {/* 헤더 영역 (정적) */}
      <header className="border-b border-slate-200/60 pb-4 sm:pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-[8px] text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-indigo-100/50 shadow-sm">
          <i className="bx bx-radar text-sm animate-pulse"></i> System Overview
        </div>
        <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900 sm:text-[32px]">
          AI 리소스 대시보드
        </h1>
        <p className="text-slate-500 font-semibold text-[14px] mt-1">
          엔터프라이즈 AI 에이전트의 API 사용량, 인프라 비용 및 시스템 상태를
          실시간으로 모니터링합니다.
        </p>
      </header>

      {/* 1. 상단 통계 카드 (서버 컴포넌트) */}
      <StatCards metrics={data.metrics} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 2. 인터랙티브 차트 (클라이언트 컴포넌트) */}
        <div className="xl:col-span-2">
          <UsageChart initialData={data.weeklyData} />
        </div>

        {/* 3. 시스템 로그 (서버 컴포넌트) */}
        <div className="xl:col-span-1">
          <SystemLogs logs={data.logs} />
        </div>
      </div>
    </div>
  );
}
