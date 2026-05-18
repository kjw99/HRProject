"use client";

import { useEffect, useState } from "react";
import useLogout from "@hooks/useLogout";
import useAuthStore from "@/lib/stores/auth";

export default function Header() {
  const logout = useLogout();
  const { user } = useAuthStore();

  // Hydration 이슈 방지: 클라이언트 마운트 후 데이터를 보여줍니다.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-16 w-full" />; // 로딩 전 빈 공간 확보

  return (
    <header className="sticky top-0 z-[50] w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 좌측: 로고 또는 서비스명 */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <i className="bx bxs-layer text-xl"></i>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800">
            HR PORTAL
          </span>
        </div>

        {/* 우측: 사용자 정보 및 로그아웃 */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 border-r border-slate-200 pr-5">
            {/* 사용자 아바타 (이름 첫 글자) */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
              {user ? user[0] : "한"}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Interviewer
              </span>
              <span className="text-sm font-bold text-slate-700">
                {user ? `${user}` : "한다솔"} 님
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          >
            <i className="bx bx-log-out text-lg transition-transform group-hover:translate-x-0.5"></i>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
