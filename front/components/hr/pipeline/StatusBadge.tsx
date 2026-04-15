"use client";

import React from "react";
import { ApplicantStatus } from "@/types/hr";

interface Props {
  status: ApplicantStatus;
}

// 💡 상태별 스타일 정의 (중앙 관리)
export const statusConfig: Record<
  ApplicantStatus,
  { label: string; style: string; icon: string }
> = {
  DOCUMENT_PASSED: {
    label: "서류합격",
    style: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: "bx-file",
  },
  INTERVIEW_SCHEDULED: {
    label: "면접배정",
    style: "bg-blue-50 text-blue-600 border-blue-100",
    icon: "bx-calendar-event",
  },
  INTERVIEW_COMPLETED: {
    label: "면접완료",
    style: "bg-purple-50 text-purple-600 border-purple-100",
    icon: "bx-check-double",
  },
  REJECTED: {
    label: "불합격",
    style: "bg-rose-50 text-rose-500 border-rose-100",
    icon: "bx-x-circle",
  },
  HIRED: {
    label: "최종합격",
    style:
      "bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-100",
    icon: "bx-party",
  },
};

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status];

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-[11px] font-black border flex items-center gap-1.5 w-fit whitespace-nowrap transition-all ${config.style}`}
    >
      <i className={`bx ${config.icon}`}></i>
      {config.label}
    </span>
  );
}
