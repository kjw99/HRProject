"use client";

interface DeptStatusRefreshButtonProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function DeptStatusRefreshButton({
  isRefreshing,
  onRefresh,
}: DeptStatusRefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isRefreshing}
      className={`group flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 sm:text-[11px] ${
        isRefreshing
          ? "border-indigo-200 bg-indigo-50 text-indigo-600"
          : "border-slate-200 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      <i
        className={`bx bx-refresh text-base transition-transform duration-500 ${
          isRefreshing ? "animate-spin" : "group-hover:rotate-180"
        }`}
      />
      {isRefreshing ? "동기화 중…" : "데이터 새로고침"}
    </button>
  );
}
