import React from "react";
import StatusTracker from "@/components/applicant/dashboard/StatusTracker";
import TodoList, { Todo } from "@/components/applicant/dashboard/TodoList";

// 📊 Mock Data (실제로는 DB에서 현재 로그인한 지원자의 데이터를 가져옵니다)
const fetchApplicantData = async () => {
  return {
    name: "홍길동",
    appliedJob: "프론트엔드 엔지니어 (React/Next.js)",
    currentStage: 2, // 1: 서류접수, 2: AI면접, 3: 심층면접, 4: 최종합격
    todos: [
      {
        id: "todo-1",
        title: "AI 역량 검사 응시",
        desc: "마감일: 2026.04.20 (D-3)",
        type: "urgent",
        link: "/applicant/interview/ready",
      },
      {
        id: "todo-2",
        title: "추가 포트폴리오 제출 (선택)",
        desc: "마감일: 2026.04.22",
        type: "normal",
        link: "#",
      },
    ],
    notices: [
      { id: 1, title: "2026년 상반기 채용 안내 가이드북", date: "2026.04.10" },
      {
        id: 2,
        title: "AI 면접 환경 세팅 및 유의사항 안내",
        date: "2026.04.12",
      },
    ],
  };
};

export default async function ApplicantDashboardPage() {
  const data = await fetchApplicantData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 🟢 환영 메시지 헤더 */}
      <header className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-[10px] text-[12px] font-black uppercase tracking-wider mb-4 border border-indigo-100/50">
            <i className="bx bx-briefcase text-sm"></i> {data.appliedJob}
          </span>
          <h1 className="text-[28px] sm:text-[36px] font-black text-slate-900 tracking-tight leading-tight">
            환영합니다, <span className="text-indigo-600">{data.name}</span> 님!
            👋
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-[15px] sm:text-[16px] max-w-2xl">
            A-RECRUIT와 함께하는 채용 여정을 시작해 볼까요?
            <br className="hidden sm:block" />
            현재 진행 상황을 확인하고 다음 단계를 준비해 보세요.
          </p>
        </div>
        {/* 장식용 배경 그래픽 */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🟢 좌측 메인 영역 (진행 현황 & 해야 할 일) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. 진행 현황 트래커 (Server Component) */}
          <section className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h2 className="text-[18px] font-black text-slate-900 mb-8 flex items-center gap-2">
              <i className="bx bx-map-alt text-slate-400 text-xl"></i> 내 지원
              현황
            </h2>
            <StatusTracker currentStage={data.currentStage} />
          </section>

          {/* 2. 해야 할 일 (Client Component) */}
          <section>
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2">
                <i className="bx bx-check-square text-indigo-500 text-xl"></i>{" "}
                나의 할 일 (To-Do)
              </h2>
              <span className="bg-indigo-100 text-indigo-700 font-bold text-[12px] px-2.5 py-1 rounded-full">
                {data.todos.length}건
              </span>
            </div>
            <TodoList todos={data.todos as Todo[]} />
          </section>
        </div>

        {/* 🟢 우측 서브 영역 (공지사항 및 안내) */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
            <h2 className="text-[16px] font-black text-slate-900 mb-6 flex items-center gap-2">
              <i className="bx bx-bell text-slate-400 text-xl"></i> 채용
              공지사항
            </h2>
            <div className="space-y-4">
              {data.notices.map((notice) => (
                <a key={notice.id} href="#" className="block group">
                  <p className="text-[14px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {notice.title}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-1 font-medium">
                    {notice.date}
                  </p>
                </a>
              ))}
            </div>

            <div className="mt-8 p-5 bg-slate-50 rounded-[20px] border border-slate-100">
              <h3 className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <i className="bx bx-help-circle text-slate-400"></i> 도움이
                필요하신가요?
              </h3>
              <p className="text-[12px] text-slate-500 mb-3">
                채용 과정 중 시스템 오류나 문의사항이 있다면 언제든 연락해
                주세요.
              </p>
              <button className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                문의하기
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
