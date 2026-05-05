import React from "react";
// import { requireRole } from "@app/server/auth/require-role";
import LogoutButton from "@/components/auth/LogoutButton";
import AdminSidebar from "@/components/admin/AdminSidebar"; // 💡 새로 만든 사이드바 임포트

export const metadata = {
  title: "관리자",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await requireRole(["admin"]);
  
  return (
    // 💡 전체를 감싸는 flex row 컨테이너 (왼쪽 사이드바, 오른쪽 메인 영역)
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* 1. 좌측 사이드바 렌더링 */}
      <AdminSidebar />

      {/* 2. 우측 콘텐츠 영역 (flex-1로 남은 공간 100% 차지) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* 상단 헤더 영역 */}
        <header className="h-20 flex items-center justify-between border-b border-slate-200 bg-white px-8">
          <div className="flex items-center gap-4">
            {/* 페이지별 타이틀을 띄워줄 수도 있고, 단순 환영 메시지를 띄워도 좋습니다. */}
            <span className="text-lg font-bold text-slate-800">
              환영합니다! 관리자님
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* 알림 아이콘 (예시) */}
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <i className='bx bx-bell text-2xl'></i>
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            
            {/* 로그아웃 버튼 */}
            <LogoutButton />
          </div>
        </header>
        
        {/* 본문(children) 영역 - 내부 스크롤 적용 */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}