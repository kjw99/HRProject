import React from 'react';
import DashboardHeader from '@/components/hr/dashboard/DashboardHeader';
import { Q1Summary, Q2Summary, Q1Data, Q2Data } from '@/components/hr/dashboard/SummaryQuadrants';
import Q3TodayInterviews, { TodayInterview } from '@/components/hr/dashboard/Q3TodayInterviews';
import Q4UpcomingInterviews, { UpcomingInterview } from '@/components/hr/dashboard/Q4UpcomingInterviews';

// 💡 SSR 데이터 패칭 시뮬레이션
async function getDashboardData() {
  const q1Data: Q1Data = { todayIntervieweeCount: 14, todayHiringTeamCount: 3 };
  const q2Data: Q2Data = { totalApplicants: 1245, activeJobs: 8 };

  const q3Data: TodayInterview[] = [
    { id: '1', time: '10:00', applicant: '홍길동', job: '프론트엔드', round: '1차 기술면접', status: '응시 완료' },
    { id: '2', time: '14:30', applicant: '김철수', job: '백엔드', round: '최종 임원면접', status: '응시 중' },
    { id: '3', time: '16:00', applicant: '이영희', job: 'UX/UI 디자이너', round: '1차 실무면접', status: '응시 전' },
  ];

  const q4Data: UpcomingInterview[] = [
    { id: 'a', date: '2026-05-12T14:00:00Z', team: '플랫폼 개발팀', round: '2차 기술 면접', expType: '경력', intervieweeCount: 3, applicantCount: 45 },
    { id: 'b', date: '2026-05-09T10:00:00Z', team: '마케팅팀', round: '1차 실무 면접', expType: '신입', intervieweeCount: 8, applicantCount: 120 },
    { id: 'c', date: '2026-05-15T16:00:00Z', team: '인프라 보안팀', round: '최종 임원 면접', expType: '경력', intervieweeCount: 2, applicantCount: 30 },
    { id: 'd', date: '2026-05-16T10:00:00Z', team: '영업기획팀', round: '1차 실무 면접', expType: '신입', intervieweeCount: 5, applicantCount: 80 },
    { id: 'e', date: '2026-05-17T13:30:00Z', team: '재무팀', round: '2차 임원 면접', expType: '무관', intervieweeCount: 1, applicantCount: 15 },
    { id: 'f', date: '2026-05-18T15:00:00Z', team: '디자인팀', round: '컬쳐핏 면접', expType: '신입', intervieweeCount: 4, applicantCount: 65 },
  ];

  return { q1Data, q2Data, q3Data, q4Data };
}

export default async function HrDashboardPage() {
  const { q1Data, q2Data, q3Data, q4Data } = await getDashboardData();

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* 상단 헤더 및 모달 버튼 */}
      <DashboardHeader />

      {/* 2x2 사분면 그리드 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

        {/* 상단 행 (1, 2사분면) */}
        {/* 💡 반응형 높이 조정: 모바일은 auto로 자연스럽게, 태블릿/PC는 h-32(128px)로 아주 슬림하게! */}
        <div className="h-auto md:h-32">
          <Q2Summary data={q2Data} />
        </div>
        <div className="h-auto md:h-32">
          <Q1Summary data={q1Data} />
        </div>


        {/* 하단 행 (3, 4사분면) */}
        <div className="min-h-100 lg:h-125">
          <Q3TodayInterviews data={q3Data} />
        </div>
        <div className="min-h-100 lg:h-125">
          <Q4UpcomingInterviews initialData={q4Data} />
        </div>

      </div>
    </div>
  );
}