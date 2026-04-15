"use client";

import React from "react";
import { Applicant, ApplicantStatus } from "@/types/hr";

interface Props {
  applicant: Applicant;
  onStatusChange: (id: string, newStatus: ApplicantStatus) => void;
  onDetailClick: (id: string) => void;
}

const statusOptions: {
  value: ApplicantStatus;
  label: string;
  color: string;
}[] = [
  {
    value: "DOCUMENT_PASSED",
    label: "서류합격",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "INTERVIEW_SCHEDULED",
    label: "면접배정",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "INTERVIEW_COMPLETED",
    label: "면접완료",
    color: "bg-purple-100 text-purple-700",
  },
  { value: "REJECTED", label: "불합격", color: "bg-rose-100 text-rose-700" },
  { value: "HIRED", label: "최종합격", color: "bg-indigo-600 text-white" },
];

export default function PipelineRow({
  applicant,
  onStatusChange,
  onDetailClick,
}: Props) {
  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group">
      <td className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-black text-slate-500 overflow-hidden">
            {applicant.avatar ? (
              <img src={applicant.avatar} alt="" />
            ) : (
              applicant.name[0]
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-[15px]">
              {applicant.name}
            </span>
            <span className="text-[12px] text-slate-400 font-medium">
              {applicant.email}
            </span>
          </div>
        </div>
      </td>
      <td className="p-5 font-bold text-slate-600 text-[14px]">
        {applicant.position}
      </td>
      <td className="p-5">
        {/* 단계 변경 드롭다운 (피그마 스타일) */}
        <select
          value={applicant.status}
          onChange={(e) =>
            onStatusChange(applicant.id, e.target.value as ApplicantStatus)
          }
          className={`px-3 py-2 rounded-xl font-black text-[12px] border-none outline-none cursor-pointer shadow-sm transition-all hover:scale-105 ${
            statusOptions.find((s) => s.value === applicant.status)?.color ||
            "bg-slate-100"
          }`}
        >
          {statusOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-white text-slate-800"
            >
              {opt.label}
            </option>
          ))}
        </select>
      </td>
      <td className="p-5 text-right">
        <button
          onClick={() => onDetailClick(applicant.id)}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-[13px] hover:bg-slate-900 hover:text-white transition-all"
        >
          상세 프로필
        </button>
      </td>
    </tr>
  );
}
