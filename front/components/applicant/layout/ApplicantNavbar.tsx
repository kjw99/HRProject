"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function ApplicantNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  // 지원자용 메뉴 구성
  const navItems = [
    {
      id: "dashboard",
      label: "지원 현황",
      icon: "bx-grid-alt",
      path: "/applicant/dashboard",
    },
    {
      id: "schedule",
      label: "면접 일정",
      icon: "bx-calendar-event",
      path: "/applicant/schedule",
    },
    {
      id: "report",
      label: "AI 역량 리포트",
      icon: "bx-bar-chart-square",
      path: "/applicant/report",
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 좌측 로고 영역 */}
          <Link className="flex items-center gap-3" href="/applicant/dashboard">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[10px] flex items-center justify-center shadow-md">
              <i className="bx bx-briefcase text-white text-lg"></i>
            </div>
            <span className="text-[18px] font-black text-slate-900 tracking-tighter">
              A-RECRUIT{" "}
              <span className="text-indigo-500 font-bold text-[14px]">
                Careers
              </span>
            </span>
          </Link>

          {/* 데스크탑 메뉴 (가운데 정렬) */}
          <div className="hidden sm:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.path);
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold transition-all duration-200 ${isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <i
                    className={`bx ${item.icon} text-lg ${isActive ? "text-indigo-500" : "text-slate-400"}`}
                  ></i>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* 우측 프로필 영역 */}
          <div className="hidden sm:flex items-center gap-4">
            <button className="text-slate-400 hover:text-indigo-500 transition-colors relative">
              <i className="bx bx-bell text-2xl"></i>
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black border border-slate-200 group-hover:border-indigo-300 transition-colors">
                홍
              </div>
              <span className="text-[13px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                홍길동 님
              </span>
              <i className="bx bx-chevron-down text-slate-400"></i>
            </div>
          </div>

          {/* 모바일 햄버거 버튼 */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-slate-800 p-2"
            >
              <i
                className={`bx ${isMobileMenuOpen ? "bx-x" : "bx-menu"} text-3xl`}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.path);
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-all ${isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <i
                    className={`bx ${item.icon} text-xl ${isActive ? "text-indigo-500" : "text-slate-400"}`}
                  ></i>
                  {item.label}
                </Link>
              );
            })}
            <div className="h-px bg-slate-100 my-2"></div>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold text-slate-500 hover:bg-slate-50"
              onClick={() => {
                // 로그아웃 처리 로직 (예: 토큰 삭제, 상태 초기화 등)
                // 예시: localStorage.removeItem('authToken');
                // 그리고 로그인 페이지로 리다이렉트
                router.push('/login'); // 로그아웃 후 이동할 페이지 경로
              }}>
              <i className="bx bx-log-out text-xl text-slate-400"></i> 로그아웃
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
