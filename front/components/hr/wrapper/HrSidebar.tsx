"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HrMenuItem } from "@/types/hr";

interface HrSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS: HrMenuItem[] = [
  { name: "대시보드", path: "/hr", icon: "bx-grid-alt" },
  { name: "부서 관리", path: "/hr/positions", icon: "bx-buildings" },
  { name: "면접관 관리", path: "/hr/interviewers", icon: "bx-user-voice" },
  { name: "이력서 파싱", path: "/hr/parsing", icon: "bx-file-find" },
  { name: "면접 일정", path: "/hr/schedule", icon: "bx-calendar" },
  { name: "이메일 템플릿", path: "/hr/email-templates", icon: "bx-envelope" },
  { name: "AI 질문 생성", path: "/hr/ai-gen", icon: "bx-brain" },
  { name: "질문 조회", path: "/hr/questions", icon: "bx-list-ul" },
];

export default function HrSidebar({ isOpen, onClose }: HrSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 animate-in fade-in duration-300 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:sticky md:top-0 md:w-64 md:translate-x-0 md:shadow-none
      `}
      >
        <div className="flex h-20 items-center border-b border-slate-800 px-8">
          <span className="text-xl font-black tracking-tighter text-white">
            HR<span className="text-indigo-500">LAB</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => window.innerWidth < 768 && onClose()}
                className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <i
                  className={`bx text-xl ${
                    item.icon
                  } ${isActive ? "" : "text-slate-500 group-hover:text-indigo-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
