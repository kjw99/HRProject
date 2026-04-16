'use client';

import React from 'react';
import { Applicant, ApplicantStatus } from '@/types/hr';
import StatusBadge from './StatusBadge';

interface Props {
  applicant: Applicant;
  onStatusChange: (id: string, newStatus: ApplicantStatus) => void;
  onDetailClick?: (id: string) => void;
}

export default function PipelineRow({ applicant, onStatusChange, onDetailClick }: Props) {
  return (
    <tr className="hover:bg-slate-50/50 transition-all border-b border-slate-50 group">
      {/* 1. 지원자 정보 섹션 */}
      <td className="p-5 align-middle">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-black border border-slate-200 shrink-0 shadow-sm group-hover:bg-white group-hover:text-indigo-600 transition-colors">
            {applicant.avatar ? (
              <img src={applicant.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
            ) : (
              applicant.name[0]
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-900 text-[15px] tracking-tight group-hover:text-indigo-600 transition-colors">
              {applicant.name}
            </span>
            <span className="text-[12px] text-slate-400 font-medium">{applicant.email}</span>
          </div>
        </div>
      </td>

      {/* 2. 직무 섹션 */}
      <td className="p-5 align-middle">
        <span className="font-semibold text-slate-700 text-[14px] bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-100">
          {applicant.position}
        </span>
      </td>

      {/* 3. 상태 변경 섹션 (💡 수정된 포인트) */}
      <td className="p-5 align-middle">
        <div className="flex items-center gap-2">
          <StatusBadge status={applicant.status} />

          {/* 💡 보이는 디자인(아이콘 박스) 위에 보이지 않는 기능(Select)을 겹칩니다 */}
          <div className="relative w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:bg-slate-50 transition-all group/select">
            {/* 눈에 보이는 아이콘 */}
            <i className='bx bx-dots-vertical-rounded text-lg text-slate-400 group-hover/select:text-indigo-500 transition-colors'></i>

            {/* 실제 클릭되는 투명한 Select 태그 */}
            <select
              value={applicant.status}
              onChange={(e) => onStatusChange(applicant.id, e.target.value as ApplicantStatus)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="상태 변경"
            >
              <option value="DOCUMENT_PASSED">서류합격</option>
              <option value="INTERVIEW_SCHEDULED">면접배정</option>
              <option value="INTERVIEW_COMPLETED">면접완료</option>
              <option value="REJECTED">불합격</option>
              <option value="HIRED">최종합격</option>
            </select>
          </div>
        </div>
      </td>

      {/* 4. 액션 섹션 */}
      <td className="p-5 text-right align-middle">
        <button
          onClick={() => onDetailClick?.(applicant.id)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm active:scale-95 inline-flex"
        >
          <i className='bx bx-right-arrow-alt text-2xl'></i>
        </button>
      </td>
    </tr>
  );
}