import Navbar from "@/components/hr/layout/Navbar";

export const metadata = {
  title: "A-RECRUIT | HR Workspace",
};

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ⚠️ Boxicons는 CDN 방식 대신 npm 패키지로 전역 _app이나 layout.tsx 상단에 import 하기를 권장합니다. */}
      {/* <link
        href="[https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css](https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css)"
        rel="stylesheet"
      /> */}

      <Navbar />

      <main className="max-w-400 mx-auto p-6 md:p-12 lg:p-16 w-full">
        {children}
      </main>

      <footer className="max-w-400 w-full mx-auto px-10 py-16 text-center mt-auto">
        <div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent mb-10"></div>
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em]">
          Core Intelligence powered by Gemini 2.5 & A-RECRUIT Architecture
        </p>
      </footer>
    </div>
  );
}
