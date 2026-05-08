'use client';

import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';

interface HrHeaderProps {
    onMenuClick: () => void;
}

export default function HrHeader({ onMenuClick }: HrHeaderProps) {
    return (
        <header className="h-16 md:h-20 flex items-center justify-between sticky top-0 z-30 px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <button onClick={onMenuClick} className="w-10 h-10 flex items-center justify-center md:hidden text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                <i className="bx bx-menu text-2xl" />
            </button>

            {/* 우측 정렬 영역 (flex-end) */}
            <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-1 pr-4 border-r border-slate-200">
                    {/* 💡 1. div -> Link로 변경하고, 패딩과 hover 효과를 주어 버튼처럼 만듭니다. */}
                    <Link
                        href="/hr/profile"
                        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        title="내 정보 보기"
                    >
                        <div className="text-right hidden sm:block">
                            {/* 실제 구현 시 이 텍스트들도 API 전역 상태값으로 치환하면 좋습니다 */}
                            <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">한다솔 팀장</p>
                            <p className="text-xs text-slate-400 mt-1">인재영입팀</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all">
                            <i className="bx bx-user text-xl" />
                        </div>
                    </Link>
                </div>
                <LogoutButton />
            </div>
        </header>
    );
}