import CalendarClient from "@/components/hr/calendar/CalendarClient";
import { fetchAdminEvents, fetchPassedApplicants } from "@/lib/axios";
import React from "react";

export const metadata = {
  title: "면접 일정 캘린더 | HR 관리자",
};

// 💡 'use client'가 없는 완벽한 서버 컴포넌트 (SSR)
export default async function HrCalendarPage() {
  try {
    // 💡 서버에서 두 종류의 데이터를 병렬로 가져옵니다.
    const [events, passedApplicants] = await Promise.all([
      fetchAdminEvents(),
      fetchPassedApplicants(), // 🆕 서류 합격자만 조회
    ]);

    return (
      <div className="space-y-6 p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-[32px] font-black tracking-tight text-slate-900">
              일정 관리
            </h1>
            <p className="text-slate-500 font-medium">
              면접 일정을 계획하고 합격자를 배정하세요.
            </p>
          </div>
        </header>

        {/* 💡 두 데이터 모두 클라이언트로 전달 */}
        <CalendarClient
          initialEvents={events}
          passedApplicants={passedApplicants}
        />
      </div>
    );
  } catch (error) {
    return <div>데이터 로딩 중 에러가 발생했습니다.</div>;
  }
}
