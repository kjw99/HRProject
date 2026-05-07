'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HrMenuItem } from '@/types/hr';

interface HrSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const MENU_ITEMS: HrMenuItem[] = [
    { name: '대시보드', path: '/hr', icon: 'bx-grid-alt' },
    { name: '이력서 파싱', path: '/hr/parsing', icon: 'bx-file-find' },
    { name: '면접 일정', path: '/hr/schedule', icon: 'bx-calendar' },
    { name: 'AI 질문 생성', path: '/hr/ai-gen', icon: 'bx-brain' },
    { name: '질문 조회', path: '/hr/questions', icon: 'bx-list-ul' },
];

export default function HrSidebar({ isOpen, onClose }: HrSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-40 md:hidden animate-in fade-in duration-300" onClick={onClose} />
            )}

            <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 flex flex-col h-screen text-slate-300 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:sticky md:top-0 md:translate-x-0 md:w-64 md:shadow-none
      `}>
                <div className="h-20 flex items-center px-8 border-b border-slate-800">
                    <span className="text-xl font-black text-white tracking-tighter">
                        HR<span className="text-indigo-500">LAB</span>
                    </span>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => window.innerWidth < 768 && onClose()}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all group
                  ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
                            >
                                <i className={`bx ${item.icon} text-xl ${isActive ? '' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}