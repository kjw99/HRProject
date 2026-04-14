import AdminHeader from "@/components/admin/layout/AdminHeader";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import React from "react";

// 서버에서만 실행되므로 메타데이터 설정 가능
export const metadata = {
  title: "Admin Console | A-RECRUIT",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* 클라이언트 컴포넌트 임포트 */}
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* 클라이언트 컴포넌트 임포트 */}
        {/* <AdminHeader /> */}

        {/* 동적 페이지 렌더링 영역 (이 children 역시 서버 컴포넌트일 수 있습니다!) */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 styled-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
}
