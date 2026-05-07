'use client';

import LogoutButton from '@/components/auth/LogoutButton';

interface HrHeaderProps {
    onMenuClick: () => void;
}

export default function HrHeader({ onMenuClick }: HrHeaderProps) {
    return (
        <header className="h-16 md:h-20 flex items-center justify-between sticky top-0 z-30 px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <button onClick={onMenuClick} className="w-10 h-10 flex items-center justify-center md:hidden text-slate-500">
                <i className="bx bx-menu text-2xl" />
            </button>

            {/* 우측 정렬 영역 (flex-end) */}
            <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 leading-none">김인사 팀장</p>
                        <p className="text-xs text-slate-400 mt-1">인재영입팀</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                        <i className="bx bx-user text-xl" />
                    </div>
                </div>
                <LogoutButton />
            </div>
        </header>
    );
}