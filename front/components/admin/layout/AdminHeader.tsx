const AdminHeader: React.FC = () => {
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">

            {/* 좌측: 전역 검색 (Global Search) */}
            {/* <div className="flex-1 max-w-md">
                <div className="relative group">
                    <i className='bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors'></i>
                    <input
                        type="text"
                        placeholder="사용자, 감사 로그, 권한 검색 (Cmd + K)"
                        className="w-full bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-300 text-[14px] font-medium text-slate-700 rounded-[16px] py-2.5 pl-12 pr-4 outline-none transition-all focus:shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex gap-1">
                        <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-400 shadow-sm">⌘</kbd>
                        <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-400 shadow-sm">K</kbd>
                    </div>
                </div>
            </div> */}

            {/* 우측: 유틸리티 및 프로필 */}
            <div className="flex items-center gap-6 ml-8">

                {/* 알림 및 설정 아이콘 */}
                <div className="flex items-center gap-2">
                    <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <i className='bx bx-bell text-[22px]'></i>
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <i className='bx bx-cog text-[22px]'></i>
                    </button>
                </div>

                {/* 프로필 드롭다운 토글 영역 */}
                <div className="flex items-center gap-3.5 pl-6 border-l border-slate-200 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-[14px] font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">시스템 관리자</p>
                        <p className="text-[11px] font-bold text-indigo-500 mt-1 uppercase tracking-wider">Super Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-sm font-black text-lg group-hover:scale-105 transition-transform">
                        S
                    </div>
                </div>

            </div>
        </header>
    );
};

export default AdminHeader;