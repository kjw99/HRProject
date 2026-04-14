'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
}

export default function AdminSidebar() {
    const pathname = usePathname(); // 현재 URL 가져오기

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
        <aside className="w-[260px] bg-[#0F172A] text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 z-20">
            {/* ... 로고 영역 생략 ... */}

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 styled-scrollbar">
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
        </aside>
    );
}