"use client";

interface DeptStatusFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  progressFilter: string;
  onProgressChange: (value: string) => void;
  progressOptions: string[];
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function DeptStatusFilterBar({
  searchQuery,
  onSearchChange,
  progressFilter,
  onProgressChange,
  progressOptions,
  onReset,
  hasActiveFilters,
}: DeptStatusFilterBarProps) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-slate-100 bg-linear-to-b from-white to-slate-50/40 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-5 sm:py-3.5">
      <div className="relative min-w-0 flex-1 sm:max-w-[220px] md:max-w-xs">
        <i className="bx bx-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="부서명 검색"
          autoComplete="off"
          aria-label="부서명 검색"
          className={`w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-[12px] font-bold text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 sm:text-[13px] ${searchQuery.trim() ? "pr-9" : ""}`}
        />
        {searchQuery.trim() ? (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <i className="bx bx-x text-lg" />
          </button>
        ) : null}
      </div>

      <div className="relative min-w-0 flex-1 sm:max-w-[200px]">
        <i className="bx bx-filter-alt pointer-events-none absolute left-3 top-1/2 z-1 -translate-y-1/2 text-slate-400" />
        <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <select
          value={progressFilter}
          onChange={(e) => onProgressChange(e.target.value)}
          aria-label="진행 단계 필터"
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-[12px] font-bold text-slate-600 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 sm:text-[13px]"
        >
          <option value="ALL">전체 진행 단계</option>
          {progressOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:shrink-0 sm:py-2"
        >
          <i className="bx bx-reset text-sm" />
          초기화
        </button>
      ) : null}
    </div>
  );
}
