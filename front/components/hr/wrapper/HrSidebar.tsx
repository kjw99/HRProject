"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HrSidebarMenuGroup } from "@/types/hr-ui";

interface HrSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_GROUPS: readonly HrSidebarMenuGroup[] = [
  {
    id: "overview",
    title: "개요",
    items: [{ name: "대시보드", path: "/hr", icon: "bx-grid-alt" }],
  },
  {
    id: "recruitment",
    title: "채용 운영",
    items: [
      { name: "지원자 관리", path: "/hr/applicants", icon: "bx-group" },
      { name: "부서 관리", path: "/hr/positions", icon: "bx-buildings" },
      { name: "면접관 관리", path: "/hr/interviewers", icon: "bx-user-voice" },
      {
        name: "면접관 메일 운영",
        path: "/hr/interviewers/communication",
        icon: "bx-send",
      },
      { name: "이력서 파싱", path: "/hr/parsing", icon: "bx-file-find" },
      { name: "면접 일정", path: "/hr/schedule", icon: "bx-calendar" },
    ],
  },
  {
    id: "content",
    title: "콘텐츠 · AI",
    items: [
      { name: "이메일 템플릿", path: "/hr/email-templates", icon: "bx-envelope" },
      { name: "AI 질문 생성", path: "/hr/ai-gen", icon: "bx-brain" },
      { name: "질문 조회", path: "/hr/questions", icon: "bx-list-ul" },
    ],
  },
];

function isMenuItemActive(pathname: string, path: string) {
  if (path === "/hr") return pathname === path;
  if (path === "/hr/interviewers") return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function HrSidebar({ isOpen, onClose }: HrSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="사이드바 닫기"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen w-[17.5rem] flex-col border-r border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/90 shadow-[4px_0_24px_-12px_rgba(15,23,42,0.12)]
          transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:w-[15.5rem] md:translate-x-0 md:shadow-none
        `}
      >
        {/* 브랜드 */}
        <div className="relative shrink-0 overflow-hidden border-b border-slate-100 px-5 pb-5 pt-6">
          <div
            className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-indigo-400/15 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-violet-300/10 blur-xl"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-50">
              <i className="bx bx-briefcase-alt-2 text-xl" />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600/90">
                Talent Ops
              </p>
              <p className="mt-0.5 text-lg font-black leading-tight tracking-tight text-slate-900">
                HR
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Console
                </span>
              </p>
            </div>
          </div>
        </div>

        <nav className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {MENU_GROUPS.map((group) => (
            <section key={group.id} className="mb-6 last:mb-0">
              <div className="mb-2.5 flex items-center gap-2 px-2">
                <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {group.title}
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent" />
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = isMenuItemActive(pathname, item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        onClick={() =>
                          window.innerWidth < 768 && onClose()
                        }
                        className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-50/90 text-indigo-950 shadow-sm shadow-indigo-100/80 ring-1 ring-indigo-100"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {isActive ? (
                          <span
                            className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500"
                            aria-hidden
                          />
                        ) : null}
                        <span
                          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-300/40"
                              : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm group-hover:ring-1 group-hover:ring-slate-200/80"
                          }`}
                        >
                          <i className={`bx text-lg ${item.icon}`} />
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate font-bold leading-snug ${
                            isActive ? "text-indigo-950" : ""
                          }`}
                        >
                          {item.name}
                        </span>
                        {isActive ? (
                          <i
                            className="bx bx-chevron-right shrink-0 text-base text-indigo-400/80"
                            aria-hidden
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        <footer className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-slate-800">채용 운영 중</p>
              <p className="truncate text-[10px] font-medium text-slate-500">
                HR 워크스페이스
              </p>
            </div>
          </div>
        </footer>
      </aside>
    </>
  );
}
