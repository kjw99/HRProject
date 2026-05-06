'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  // 💡 메뉴 구성 리스트
  const menuItems = [
    { name: '대시보드', path: '/admin', icon: 'bx-grid-alt' },
    { name: '사용자 관리', path: '/admin/users', icon: 'bx-user' },
    { name: '공장 및 고객사 관리', path: '/admin/factories', icon: 'bx-buildings' },
    { name: '페이지 접근 제어', path: '/admin/routes', icon: 'bx-shield-quarter' },
    { name: '토큰 사용량 모니터링', path: '/admin/tokens', icon: 'bx-coin-stack' },
    { name: '시스템 설정', path: '/admin/settings', icon: 'bx-cog' },
  ];

  return (
    <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col min-h-screen text-slate-300">
      {/* 로고 영역 */}
      <div className="h-20 flex items-center px-8 border-b border-slate-800">
        <i className='bx bxs-component text-3xl text-indigo-500 mr-3'></i>
        <span className="text-xl font-black text-white tracking-tight">Admin<span className="text-indigo-500">Portal</span></span>
      </div>

      {/* 메뉴 리스트 영역 */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Management
        </p>
        
        {menuItems.map((item) => {
          // 정확한 하위 경로 매칭을 위한 로직 (예: /admin/users 와 /admin/users/1 모두 매칭)
          const isActive = item.path === '/admin' 
            ? pathname === '/admin' 
            : pathname.startsWith(item.path);

          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <i className={`bx ${item.icon} text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}></i>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 하단 관리자 프로필 요약 영역 (옵션) */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">최고 관리자</p>
            <p className="text-xs text-slate-400 truncate">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
} 