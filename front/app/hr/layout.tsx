import Navbar from "@/components/hr/layout/Navbar";

export const metadata = {
  title: "A-RECRUIT | HR Workspace",
};

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    // 💡 1. flex와 flex-col을 추가하여 요소들이 위에서 아래로 수직 배치되도록 합니다.
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* 상단 네비게이션 */}
      <Navbar />

      {/* 💡 2. flex-1을 추가하여 메인 콘텐츠 영역이 화면의 남은 세로 공간을 꽉 채우도록 합니다. */}
      {/* 이렇게 하면 내용이 적어도 푸터를 화면 맨 아래로 밀어냅니다. */}
      <main className="flex-1 max-w-400 mx-auto p-3.5 md:p-3.5 lg:p-3.5 w-full">
        {children}
      </main>

      {/* 💡 3. mt-auto가 정상 작동하여 푸터가 항상 바닥에 예쁘게 붙게 됩니다. */}
      <footer className="max-w-400 w-full mx-auto px-10 py-16 text-center mt-auto">
        <div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent mb-10"></div>
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em]">
          Core Intelligence powered by Gemini 2.5 & A-RECRUIT Architecture
        </p>
      </footer>

    </div>
  );
}