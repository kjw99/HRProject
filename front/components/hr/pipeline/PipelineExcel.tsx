'use client';

import React, { useState, useMemo } from 'react';
import { Applicant, ApplicantStatus } from '@/types/hr';
import PipelineRow from './PipelineRow';

export default function PipelineExcel({ initialApplicants }: { initialApplicants: Applicant[] }) {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return applicants.filter(app =>
      app.name.includes(searchTerm) || app.position.includes(searchTerm)
    );
  }, [applicants, searchTerm]);

  const handleStatusChange = (id: string, newStatus: ApplicantStatus) => {
    setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1 max-w-md">
          <i className='bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl'></i>
          <input
            type="text"
            placeholder="지원자 명 또는 직무 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 font-bold outline-none focus:ring-2 ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Position</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Pipeline Status</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map(app => (
                <PipelineRow key={app.id} applicant={app} onStatusChange={handleStatusChange} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}