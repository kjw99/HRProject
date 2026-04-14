import React from "react";
import InterviewSession from "@/components/applicant/interview/InterviewSession";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>; // 💡 Promise로 타입 변경
}) {
  // 💡 await를 통해 내부 값을 꺼내옵니다.
  const resolvedParams = await params;
  const sessionId = resolvedParams.sessionId;
  return (
    // 면접실은 상단 네비게이션을 가리거나 최소화한 몰입형 레이아웃이 권장됩니다.
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col overflow-hidden animate-in fade-in duration-1000">
      {/* 면접실 헤더: 정보 및 타이머 */}
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
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-400">
              남은 시간
            </span>
            <span className="text-[18px] font-black text-rose-500 font-mono">
              18:42
            </span>
          </div>
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center">
            <i className="bx bx-exit text-2xl"></i>
          </button>
        </div>
      </header>

      {/* 면접 메인 콘텐츠 (Client Component) */}
      {/* <main className="flex-1 flex flex-col lg:flex-row p-6 sm:p-8 gap-8">
        <InterviewSession />
      </main> */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row p-6 sm:p-8 gap-8">
        <InterviewSession />
      </main>

      {/* 하단 상태바 */}
      <footer className="h-12 bg-white border-t border-slate-100 px-8 flex items-center justify-center gap-8 shrink-0">
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 시스템
          정상 작동 중
        </div>
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
          <i className="bx bx-lock-alt"></i> 종단간 암호화 보안 적용
        </div>
      </footer>
    </div>
  );
}
