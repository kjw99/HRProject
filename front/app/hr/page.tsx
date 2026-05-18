import React from "react";
import DashboardHeader from "@/components/hr/dashboard/DashboardHeader";
import {
  Q1Summary,
  Q2Summary,
  Q1Data,
  Q2Data,
} from "@/components/hr/dashboard/SummaryQuadrants";
import Q3TodayInterviews, {
  TodayInterview,
} from "@/components/hr/dashboard/Q3TodayInterviews";
import DeptStatusDashboard from "@/components/hr/dashboard/DeptStatusDashboard";
import type { DeptInterviewRecord } from "@/components/hr/dashboard/DeptInterviewModal";
import { DeptStatus } from "@/types/hr";
import {
  fetchApplicantsServer,
  fetchDeptStatusServer,
  fetchTodayInterviewSchedulesServer,
} from "../server/hr/applicant.server";

function mapAttendanceStatusToUi(status: string): TodayInterview["status"] {
  if (status.includes("완료")) return "완료" as TodayInterview["status"];
  if (status.includes("진행")) return "진행중" as TodayInterview["status"];
  return "대기" as TodayInterview["status"];
}

async function getDashboardData() {
  const results = await Promise.all([
    fetchApplicantsServer(),
    fetchDeptStatusServer(),
    fetchTodayInterviewSchedulesServer(),
  ]);

  const applicants = results[0];
  const deptStatus = results[1];
  const todaySchedules = results[2];

  const totalApplicants: number = applicants.length;
  const activeJobs: number = new Set(
    applicants.map((applicant) => applicant.position_id),
  ).size;

  const todayIntervieweeCount = todaySchedules.length;
  const todayHiringTeamCount = new Set(
    todaySchedules.map((item) => item.positionName ?? "미지정"),
  ).size;

  const q1Data: Q1Data = {
    todayIntervieweeCount,
    todayHiringTeamCount,
  };

  const q2Data: Q2Data = {
    totalApplicants,
    activeJobs,
  };

  const q3Data: TodayInterview[] = todaySchedules.map((item) => ({
    id: String(item.bookingId || item.slotId),
    time: item.interviewTimeLabel,
    applicant: item.candidateName,
    job: item.positionName ?? "미지정",
    round: item.interviewRound,
    status: mapAttendanceStatusToUi(item.attendanceStatus),
  }));

  const interviewRecords: DeptInterviewRecord[] = todaySchedules.map((item) => {
    const start = new Date(item.interviewStartsAt);
    const y = start.getFullYear();
    const m = String(start.getMonth() + 1).padStart(2, "0");
    const d = String(start.getDate()).padStart(2, "0");
    return {
      id: String(item.bookingId || item.slotId),
      deptName: item.positionName ?? "미지정",
      applicantName: item.candidateName,
      interviewDate: `${y}-${m}-${d}`,
      interviewTime: item.interviewTimeLabel,
      round: item.interviewRound,
      interviewer: "-",
      status: mapAttendanceStatusToUi(item.attendanceStatus),
    };
  });

  const q4Data: DeptStatus[] = deptStatus;

  return {
    q1Data,
    q2Data,
    q3Data,
    q4Data,
    applicants,
    interviewRecords,
  };
}

export default async function HrDashboardPage() {
  const { q1Data, q2Data, q3Data, q4Data, applicants, interviewRecords } =
    await getDashboardData();

  return (
    <div className="w-full animate-in fade-in duration-500">
      <DashboardHeader applicants={applicants} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="h-auto md:h-32">
          <Q2Summary data={q2Data} />
        </div>
        <div className="h-auto md:h-32">
          <Q1Summary data={q1Data} />
        </div>

        <div className="min-h-100 lg:h-125">
          <Q3TodayInterviews data={q3Data} />
        </div>
        <div className="min-h-100 lg:h-125">
          <DeptStatusDashboard
            initialData={q4Data}
            interviewRecords={interviewRecords}
          />
        </div>
      </div>
    </div>
  );
}
