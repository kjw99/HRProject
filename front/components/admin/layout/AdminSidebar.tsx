'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
}

type AdminSidebarProps = {
    mobileOpen?: boolean;
    onNavigate?: () => void;
};

export default function AdminSidebar({
    mobileOpen = false,
    onNavigate,
}: AdminSidebarProps = {}) {
    const pathname = usePathname(); // 현재 URL 가져오기
    const router = useRouter(); // 라우터 가져오기

    const menuGroups = [
        {
            title: 'Overview',
            items: [
                { id: 'dashboard', label: '시스템 대시보드', icon: 'bx-bar-chart-alt-2', path: '/admin' },
            ]
        },
        {
            title: 'Management',
            items: [
                { id: 'accounts', label: '계정 및 권한 관리', icon: 'bx-shield-quarter', path: '/admin/accounts' },
            ]
        },
    ];

    return (
        <aside
            id="admin-sidebar"
            className={`fixed inset-y-0 left-0 z-30 flex h-dvh w-[min(100vw-2.5rem,260px)] shrink-0 flex-col border-r border-slate-800 bg-[#0F172A] text-slate-300 transition-transform duration-300 ease-out sm:w-[260px] lg:static lg:z-auto lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
            {/* 상단 모바일 닫기 버튼 영역 */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-4 lg:hidden">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Menu
                </span>
                <button
                    type="button"
                    onClick={() => onNavigate?.()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    aria-label="메뉴 닫기"
                >
                    <i className="bx bx-x text-2xl" />
                </button>
            </div>

            {/* 메인 네비게이션 메뉴 (스크롤 영역) */}
            <nav className="styled-scrollbar flex-1 space-y-8 overflow-y-auto px-4 py-6">
                {menuGroups.map((group, idx) => (
                    <div key={idx}>
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">
                            {group.title}
                        </h3>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                // 현재 URL과 메뉴의 path가 일치하는지 확인하여 active 상태 결정
                                const isActive = pathname === item.path;
                                return (
                                    <li key={item.id}>
                                        <Link
                                            href={item.path}
                                            onClick={() => onNavigate?.()}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-bold transition-all duration-200 ${isActive
                                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                                }`}
                                        >
                                            <i className={`bx ${item.icon} text-xl ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}></i>
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* 💡 하단 고정 로그아웃 영역 추가 */}
            <div className="border-t border-slate-800/80 p-4 shrink-0">
                <button
                    type="button"
                    onClick={() => {
                        // TODO: 실제 로그아웃 로직 추가 (예: signOut(), 로컬 스토리지 삭제 등)
                        localStorage.removeItem('candidate_info');
                        localStorage.removeItem('last_job_posting');
                        router.push('/login'); // 로그아웃 후 로그인 페이지로 리디렉션
                        console.log('로그아웃 클릭됨');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-bold text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-rose-400 group"
                >
                    <i className="bx bx-log-out text-xl text-slate-500 group-hover:text-rose-400 transition-colors"></i>
                    로그아웃
                </button>
            </div>
        </aside>
    );
}