// app/applicant/interview/[sessionId]/page.tsx
import React from "react";
import InterviewSession from "@/components/applicant/interview/InterviewSession";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col overflow-hidden">
      {/* 헤더: 고정 (shrink-0) */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i className="bx bx-brain text-white text-xl"></i>
          </div>
          <span className="font-black text-slate-800 tracking-tighter">
            AI INTERVIEW{" "}
            <span className="text-slate-400 font-bold text-[12px] ml-2">
              #{sessionId}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono text-rose-500 font-black">
            <span className="text-[12px] text-slate-400">남은 시간</span> 18:42
          </div>
        </div>
      </header>

      {/* 메인: 내부 스크롤 허용 (overflow-hidden) */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row p-4 sm:p-8 gap-6">
        <InterviewSession />
      </main>

      {/* 푸터: 고정 (shrink-0) */}
      <footer className="h-12 bg-white border-t border-slate-100 px-8 flex items-center justify-center gap-8 shrink-0">
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 시스템
          정상
        </div>
      </footer>
    </div>
  );
}
