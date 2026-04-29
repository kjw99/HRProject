import CalendarClient from "@/components/hr/calendar/CalendarClient";
import ScheduleBoard from "@/components/hr/calendar/ScheduleBoard";
import { fetchAdminEvents, fetchPassedApplicants } from "@/lib/axios";
import React from "react";

export const metadata = {
  title: "면접 일정 캘린더 | HR 관리자",
};

// 💡 'use client'가 없는 완벽한 서버 컴포넌트 (SSR)
// export default async function HrCalendarPage() {
//   try {
//     // 💡 서버에서 두 종류의 데이터를 병렬로 가져옵니다.
//     const [events, passedApplicants] = await Promise.all([
//       fetchAdminEvents(),
//       fetchPassedApplicants(), // 🆕 서류 합격자만 조회
//     ]);

//     return (
//       <div className="space-y-6 p-8 max-w-7xl mx-auto">
//         <header className="flex justify-between items-end">
//           <div>
//             <h1 className="text-[32px] font-black tracking-tight text-slate-900">
//               일정 관리
//             </h1>
//             <p className="text-slate-500 font-medium">
//               면접 일정을 계획하고 합격자를 배정하세요.
//             </p>
//           </div>
//         </header>

//         {/* 💡 두 데이터 모두 클라이언트로 전달 */}
//         <CalendarClient
//           initialEvents={events}
//           passedApplicants={passedApplicants}
//         />
//       </div>
//     );
//   } catch (error) {
//     return <div>데이터 로딩 중 에러가 발생했습니다.</div>;
//   }
// }


export interface InterviewEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  applicantName: string;
  type: '1차 면접' | '2차 면접' | '최종 면접' | '기타';
  description: string;
}

// SSR 데이터 페칭 시뮬레이션
async function getScheduleData(): Promise<InterviewEvent[]> {
  // 실제로는 await db.query() 등이 들어갑니다.
  return [
    { id: '1', date: '2026-04-25', time: '14:00', title: '프론트엔드 기술 면접', applicantName: '김철수', type: '1차 면접', description: 'React 및 Next.js 아키텍처 위주의 질문 진행 예정' },
    { id: '2', date: '2026-04-25', time: '16:00', title: '프로덕트 디자이너 포폴 리뷰', applicantName: '이영희', type: '1차 면접', description: 'Figma 컴포넌트 활용 능력 중점 확인' },
    { id: '3', date: '2026-04-28', time: '10:00', title: '백엔드 임원 면접', applicantName: '박지성', type: '최종 면접', description: '컬처핏 및 커뮤니케이션 스킬 검증' },
  ];
}

export default async function SchedulePage() {
  const initialEvents = await getScheduleData();

  return (
    <main className="min-h-screen bg-slate-50 pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">면접 일정 관리</h1>
          <p className="text-sm text-slate-500 mt-1">캘린더를 통해 전체 면접 일정을 관리하세요.</p>
        </header>

        {/* 클라이언트 컴포넌트로 데이터 주입 */}
        <ScheduleBoard initialEvents={initialEvents} />
      </div>
    </main>
  );
}