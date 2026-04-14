const FilterBar = ({ search, setSearch, filterRole, setFilterRole }: { search: string, setSearch: (v: string) => void, filterRole: string, setFilterRole: (v: string) => void }) => (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-[350px]">
            <i className='bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl'></i>
            <input
                type="text" placeholder="이름, 이메일, 부서 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-[16px] py-3.5 pl-11 pr-4 font-semibold outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm text-[14px]"
            />
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-[16px] border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
            {['All', 'Super Admin', 'HR Manager', 'Interviewer', 'Viewer'].map(role => (
                <button key={role} onClick={() => setFilterRole(role)} className={`px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-colors ${filterRole === role ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {role}
                </button>
            ))}
        </div>
    </div>
);

export default FilterBar
