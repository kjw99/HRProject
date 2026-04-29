'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 💡 아이콘을 조금 더 모던한 Boxicons 라인업으로 수정했습니다.
const navItems = [
    { name: '내 프로필', href: '/hr/settings/profile', icon: 'bx-user-circle' },
    { name: '직무 관리', href: '/hr/settings/jobs', icon: 'bx-briefcase' },
    { name: '팀 및 권한 관리', href: '/hr/settings/team', icon: 'bx-group' },
    { name: '알림 설정', href: '/hr/settings/notifications', icon: 'bx-bell' },
    { name: '보안 및 인증', href: '/hr/settings/security', icon: 'bx-shield-quarter' },
    { name: '결제 및 플랜', href: '/hr/settings/billing', icon: 'bx-credit-card-front' },
];

export default function SettingsSidebar() {
    const pathname = usePathname();

    return (
        // 💡 md:sticky md:top-8 을 추가하여, 우측 설정 내용이 길어 스크롤을 내려도 사이드바는 화면에 고정되게 만들었습니다.
        <aside className="w-full md:w-64 shrink-0 flex flex-col md:sticky md:top-8">

            {/* 💡 헤더 영역: 서브 타이틀을 추가하여 안정감을 높였습니다. */}
            <div className="px-2 md:px-4 mb-6 md:mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">환경 설정</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">워크스페이스 및 계정 관리</p>
            </div>

            {/* 💡 모바일 가로 스크롤 시 좌우 여백을 자연스럽게 주기 위한 래퍼 */}
            <div className="w-full -mx-4 px-4 md:mx-0 md:px-0">
                <nav className="flex flex-row md:flex-col gap-2 md:gap-1.5 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
                    {navItems.map((item) => {
                        // 현재 경로 확인 (예제에서는 임시로 profile을 기본 활성화 상태로 볼 수 있게 세팅 가능)
                        const isActive = pathname?.includes(item.href) || (pathname === '/' && item.name === '내 프로필');

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-2xl md:rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap group select-none
                                    ${isActive
                                        // 💡 Active 상태: 떠오르는 느낌의 하얀색 카드 UI + 미세한 그림자
                                        ? 'bg-white text-indigo-600 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-200/80'
                                        // 💡 Inactive 상태: 투명하지만 마우스를 올리면 옅은 회색 배경
                                        : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
                                    }`}
                            >
                                {/* 💡 Desktop Active Indicator: 왼쪽에 작은 파란색 바를 띄워 현재 위치를 더욱 명확히 표시 */}
                                {isActive && (
                                    <div className="hidden md:block absolute -left-[1.5px] top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-full" />
                                )}

                                {/* 💡 아이콘 래퍼: 호버 시 아이콘 래퍼 자체도 반응하도록 디테일 추가 */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'bg-transparent text-slate-400 group-hover:bg-white group-hover:text-slate-700 group-hover:shadow-sm group-hover:border group-hover:border-slate-100'
                                    }
                                `}>
                                    <i className={`bx ${item.icon} text-xl`}></i>
                                </div>
                                <span className="tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}