import React from "react";
import ApplicantNavbar from "@/components/applicant/layout/ApplicantNavbar";

export const metadata = {
  title: "내 지원 현황 | A-RECRUIT Careers",
  description: "A-RECRUIT 채용 포털 지원자 대시보드입니다.",
};

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 지원자 화면은 Admin(어두운 사이드바)과 달리 밝고 가벼운 톤(bg-slate-50)으로 구성합니다.
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* 공통 상단 네비게이션 (Client Component) */}
      <ApplicantNavbar />

      {/* 개별 페이지 컨텐츠가 렌더링되는 영역 (Server/Client 혼합 가능) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
        {children}
      </main>

      {/* 공통 푸터 (선택 사항) */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 mt-auto">
        <p className="text-center text-[13px] font-bold text-slate-400">
          © 2026 A-RECRUIT. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
