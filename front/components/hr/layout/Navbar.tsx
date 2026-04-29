"use client";
import useAuthStore from "@/store/getAuth";
import { useState, useEffect, useRef } from "react"; // useEffect, useRef 추가
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ToastUI } from "@/components/rest/ToastUI";
import useLogout from "@/hooks/useLogout";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // 💡 프로필 모달 상태 추가
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const logout = useLogout();
  const profileDropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 드롭다운 Ref가 존재하고, 클릭한 요소(event.target)가 드롭다운 내부에 없으면 닫기
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileModalOpen(false);
      }
    };

    // 모달이 열려있을 때만 마우스 클릭 이벤트 리스너 작동
    if (isProfileModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // 클린업: 컴포넌트가 언마운트되거나 모달이 닫힐 때 리스너 제거
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileModalOpen]);
  const menuItems = [
    { id: "generator", label: "AI 질문 생성기", icon: "bx-plus", path: "/hr/agent" },
    { id: "pipeline", label: "지원자 관리", icon: "bx-group", path: "/hr/pipeline" },
    { id: "settings", label: "시스템 설정", icon: "bx-cog", path: "/hr/settings" },
    { id: "upload", label: "업로드", icon: "bx-arrow-to-top", path: "/hr/upload" },
    // { id: "calendar", label: "캘린더", icon: "bx-calendar", path: "/hr/calendar" },
    // { id: "excel", label: "엑셀 관리", icon: "bx-file", path: "/hr/excel" },
  ];
  const handleNavigate = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-400 mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">

        {/* 로고 및 좌측 메뉴 */}
        <div className="flex items-center gap-12">
          <div
            className="flex items-center gap-3.5 group cursor-pointer active:scale-95 transition-transform"
            onClick={() => handleNavigate("/hr/agent")}
          >
            <div className="w-11 h-11 bg-linear-to-br from-blue-500 to-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-all duration-300">
              <i className="bx bx-brain text-white text-[24px]"></i>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[20px] font-black text-slate-900 tracking-tighter leading-none">
                A-RECRUIT
              </h1>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.25em] mt-1 opacity-80">
                HR Intelligence
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-300 ${isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100/50 -translate-y-px"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
                    }`}
                >
                  <i className={`bx ${item.icon} text-[20px] ${isActive ? "text-blue-500" : "text-slate-400"}`}></i>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 우측 유저 컨트롤 영역 */}
        <div className="flex items-center gap-6 relative" ref={profileDropdownRef}>
          <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-[14px] hover:bg-slate-50 text-slate-400 hover:text-blue-500 transition-all border border-transparent hover:border-slate-200">
            <i className="bx bx-bell text-[22px]"></i>
          </button>

          {/* 💡 1. 프로필 영역 (클릭 시 모달 토글) */}
          <div
            className="flex items-center gap-4 pl-6 border-l border-slate-200/80 group cursor-pointer relative"
            onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                김인사 매니저
              </p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Senior Recruiter
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-300 transition-all overflow-hidden">
              <i className="bx bxs-user text-[24px] mt-1"></i>
            </div>
          </div>

          {/* 💡 2. 프로필 미니 모달 (Dropdown) */}
          {isProfileModalOpen && (
            <>
              {/* 모달 본체 */}
              <div className="absolute right-0 top-[calc(100%+16px)] z-50 w-72 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                {/* 유저 상세 정보 영역 */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">이름</span>
                      <span className="text-sm font-black text-slate-900">김인사</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">직함</span>
                      <span className="text-sm font-black text-slate-900">매니저</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">사번</span>
                      <span className="text-sm font-black text-slate-900">M2401</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-500">이메일</span>
                      <span className="text-xs font-bold text-blue-600">hr@midasit.com</span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 영역 */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      alert("내 정보 페이지로 이동합니다.");
                      setIsProfileModalOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-colors"
                  >
                    <i className="bx bx-user-circle text-[20px]"></i> 내 정보 관리
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors mt-1"
                  >
                    <i className="bx bx-log-out text-[20px]"></i> 로그아웃 하기
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            className="lg:hidden text-slate-600 p-2 bg-slate-50 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`bx ${isMobileMenuOpen ? "bx-x" : "bx-menu-alt-right"} text-[24px]`}></i>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 (기존 코드 유지) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 p-6 shadow-2xl absolute w-full left-0 top-20 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`p-4 rounded-2xl font-bold text-left flex items-center gap-4 transition-colors ${isActive
                    ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                    : "text-slate-600 bg-slate-50 hover:bg-slate-100"
                    }`}
                >
                  <i className={`bx ${item.icon} text-[24px]`}></i>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}