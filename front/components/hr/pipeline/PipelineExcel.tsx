'use client';

import React, { useState, useMemo } from 'react';
import { Applicant, ApplicantStatus } from '@/types/hr';
import PipelineRow from './PipelineRow';

export default function PipelineExcel({ initialApplicants }: { initialApplicants: Applicant[] }) {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'ALL'>('ALL');

  // 💡 필터링 로직 (검색어 + 상태)
  const filteredData = useMemo(() => {
    return applicants.filter(app => {
      const matchSearch = app.name.includes(searchTerm) || app.position.includes(searchTerm);
      const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applicants, searchTerm, statusFilter]);

  const handleStatusUpdate = (id: string, newStatus: ApplicantStatus) => {
    setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    // 실제 환경에서는 여기서 axios.patch(`/api/hr/applicants/${id}`, { status: newStatus }) 호출
  };

  return (
    <div className="space-y-6">
      {/* 🟢 필터 바 */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <i className='bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl'></i>
          <input 
            type="text"
            placeholder="지원자 이름 또는 직무 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'DOCUMENT_PASSED', 'INTERVIEW_SCHEDULED', 'HIRED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-xl text-[12px] font-black whitespace-nowrap transition-all ${
                statusFilter === status 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? '전체보기' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 엑셀 스타일 테이블 */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
              <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Position</th>
              <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Pipeline Status</th>
              <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(app => (
              <PipelineRow 
                key={app.id} 
                applicant={app} 
                onStatusChange={handleStatusUpdate}
                onDetailClick={(id) => console.log(id, "상세보기")}
              />
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-bold">해당하는 지원자가 없습니다.</div>
        )}
      </div>
    </div>
  );
}