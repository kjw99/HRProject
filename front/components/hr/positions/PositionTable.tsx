import { Position } from "@/types/position";
import { SortKey, SortOrder } from "./PositionClient";

interface PositionTableProps {
  positions: Position[];
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
  onEdit: (pos: Position) => void;
  onDelete: (pos: Position) => void;
}

export default function PositionTable({
  positions,
  sortKey,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: PositionTableProps) {
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <i className="bx bx-sort ml-1 text-slate-300" />;
    }
    return sortOrder === "asc" ? (
      <i className="bx bx-sort-up ml-1 text-indigo-500" />
    ) : (
      <i className="bx bx-sort-down ml-1 text-indigo-500" />
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (positions.length === 0) {
    return (
      <div className="flex animate-in fade-in flex-col items-center justify-center px-4 py-16 sm:py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/50 sm:h-18 sm:w-18">
          <i className="bx bx-briefcase text-3xl text-slate-300 sm:text-4xl" />
        </div>
        <p className="text-center text-[14px] font-bold text-slate-600">
          등록된 직무가 없습니다
        </p>
        <p className="mt-1 max-w-xs text-center text-[12px] font-medium leading-relaxed text-slate-400">
          <i className="bx bx-plus-circle mr-0.5 inline align-text-bottom text-indigo-400" />
          상단의 &apos;새 직무 추가&apos;로 직무를 등록해 보세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[560px] w-full">
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_200px_100px] border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <button
                type="button"
                className="flex w-max cursor-pointer items-center transition-colors hover:text-slate-600"
                onClick={() => onSort("positionName")}
              >
                직무명{renderSortIcon("positionName")}
              </button>
              <button
                type="button"
                className="flex w-max cursor-pointer items-center transition-colors hover:text-slate-600"
                onClick={() => onSort("createdAt")}
              >
                생성일{renderSortIcon("createdAt")}
              </button>
              <div className="text-right">관리</div>
            </div>

            <div className="divide-y divide-slate-100">
              {positions.map((pos) => (
                <div
                  key={pos.positionId}
                  className="group grid grid-cols-[1fr_200px_100px] items-center px-6 py-4 transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50">
                      <i className="bx bx-briefcase-alt text-sm text-indigo-500" />
                    </div>
                  <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                    <span className="truncate text-[14px] font-bold text-slate-800">
                      {pos.positionName}
                    </span>
                    <span className="hidden shrink-0 items-center gap-1 text-[11px] font-bold tabular-nums text-slate-400 sm:inline-flex">
                      <i className="bx bx-hash text-slate-300" />
                      {pos.positionId}
                    </span>
                  </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                    <i className="bx bx-calendar text-slate-400" />
                    {formatDate(pos.createdAt)}
                  </div>

                  <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEdit(pos)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                      title="수정"
                    >
                      <i className="bx bx-edit text-lg" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(pos)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                      title="삭제"
                    >
                      <i className="bx bx-trash text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-3 p-3 sm:p-4 lg:hidden">
        {positions.map((pos) => (
          <li
            key={pos.positionId}
            className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/40 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50">
                  <i className="bx bx-briefcase-alt text-lg text-indigo-500" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-[15px] font-black text-slate-900">
                    {pos.positionName}
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                    <i className="bx bx-calendar text-slate-400" />
                    {formatDate(pos.createdAt)}
                  </p>
                  <p className="inline-flex items-center gap-1 text-[11px] font-bold tabular-nums text-slate-400">
                    <i className="bx bx-hash text-slate-300" />
                    ID {pos.positionId}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(pos)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600"
                  title="수정"
                >
                  <i className="bx bx-edit text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(pos)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 shadow-sm transition-all hover:border-rose-200 hover:text-rose-600"
                  title="삭제"
                >
                  <i className="bx bx-trash text-lg" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
