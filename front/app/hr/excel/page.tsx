import React from "react";
import ScheduleTable from "@/components/hr/excel/ScheduleTable";
import { fetchAdminEvents, fetchPassedApplicants } from "@/lib/axios";
import {
  CalendarEvent,
  PassedApplicant,
} from "@/types/hr";

export const metadata = { title: "일정 통합 관리 (Excel) | HR" };

export default async function HrExcelPage() {
  // 서버에서 데이터 병렬 로드
  const [events, applicants] = await Promise.all([
    fetchAdminEvents(),
    fetchPassedApplicants(),
  ]);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black text-slate-900 tracking-tight flex items-center gap-3">
            <i className="bx bx-spreadsheet text-indigo-500"></i> 일정 통합 관리
          </h1>
          <p className="text-slate-500 font-medium">
            엑셀 형태로 면접 일정을 상세하게 관리하고 편집하세요.
          </p>
        </div>
      </header>

      {/* 클라이언트 컴포넌트에 데이터 주입 */}
      <ScheduleTable initialEvents={events as CalendarEvent[]} passedApplicants={applicants as PassedApplicant[]} />
    </div>
  );
}
