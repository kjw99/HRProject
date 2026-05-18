'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 💡 Props 타입 정의 (오픈 상태 및 닫기 함수 받기)
interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: '대시보드', path: '/admin', icon: 'bx-grid-alt' },
    { name: '사용자 관리', path: '/admin/users', icon: 'bx-user' },
    // 필요 시 주석 해제
    // { name: '공장 관리', path: '/admin/factories', icon: 'bx-buildings' },
    // { name: '접근 제어', path: '/admin/routes', icon: 'bx-shield-quarter' },
  ];

  return (
    <>
      {/* 💡 [모바일 전용] 사이드바 열렸을 때 배경 어둡게 처리 (Ovelay Backdrop) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden animate-in fade-in duration-300"
          onClick={onClose} // 배경 클릭 시 닫기
        />
      )}

      {/* 사이드바 본체 */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 flex flex-col h-screen text-slate-300 shrink-0
          transition-transform duration-300 ease-in-out shadow-2xl border-r border-slate-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} // 모바일 열림/닫힘 핵심 로직
          md:sticky md:top-0 md:translate-x-0 md:w-64 md:z-auto md:shadow-none // 💡 핵심: md:relative를 md:top-0으로 변경!
        `}
      >
        {/* 로고 영역 */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-slate-800 md:h-20 md:px-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <i className='bx bxs-component text-3xl text-indigo-500'></i>
            <span className="text-xl font-black text-white tracking-tighter">Admin<span className="text-indigo-500">Portal</span></span>
          </Link>

          {/* 💡 [모바일 전용] 닫기 버튼 (X) */}
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-full md:hidden"
          >
            <i className='bx bx-x text-2xl'></i>
          </button>
        </div>

        {/* 메뉴 리스트 영역 */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">
            Management
          </p>

          {menuItems.map((item) => {
            const isActive = item.path === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) onClose(); // 모바일에서는 링크 클릭 시 사이드바 닫기
                }}
                className={`flex items-center gap-3.5 px-4 py-3 h-12 rounded-xl text-sm font-bold transition-all duration-200 group
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' // Figma primary 스타일
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
              >
                <i className={`bx ${item.icon} text-xl transition-transform duration- group-hover:scale-110 ${isActive ? '' : 'text-slate-500 group-hover:text-indigo-400'}`}></i>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 하단 관리자 프로필 영역 */}
        <div className="p-4 border-t border-slate-800 mt-auto bg-slate-900/50">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 shadow-inner">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">최고 관리자</p>
              <p className="text-xs text-slate-500 truncate">System Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}