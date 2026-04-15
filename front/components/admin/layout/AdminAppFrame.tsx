"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";

export default function AdminAppFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-[#F8FAFC] font-sans overflow-hidden">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="내비게이션 닫기"
          className="fixed inset-0 z-10 bg-slate-900/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AdminSidebar
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-[0_1px_0_rgba(15,23,42,0.06)] lg:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition-colors hover:bg-slate-50"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="admin-sidebar"
            aria-label="메뉴 열기"
          >
            <i className="bx bx-menu-alt-left text-2xl" />
          </button>
          <span className="text-sm font-black tracking-tight text-slate-800">
            Admin Console
          </span>
        </header>

        <main className="styled-scrollbar relative min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
