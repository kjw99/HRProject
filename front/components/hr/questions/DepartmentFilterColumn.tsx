"use client";

import type { HrDepartmentOption } from "@/types/hr-questions";

export interface DepartmentFilterColumnProps {
  departments: HrDepartmentOption[];
  filterText: string;
  onFilterTextChange: (value: string) => void;
  selectedDepartmentId: number | null;
  onSelectDepartment: (departmentId: number) => void;
  /** `positionId` → 저장된 질문 개수 */
  questionCountByDepartmentId: Readonly<Record<number, number>>;
  isQuestionCountLoading: boolean;
}

function normalizeForSearch(value: string): string {
  return value.trim().toLowerCase();
}

export default function DepartmentFilterColumn({
  departments,
  filterText,
  onFilterTextChange,
  selectedDepartmentId,
  onSelectDepartment,
  questionCountByDepartmentId,
  isQuestionCountLoading,
}: DepartmentFilterColumnProps) {
  const q = normalizeForSearch(filterText);
  const filtered = q
    ? departments.filter((d) =>
        normalizeForSearch(d.positionName).includes(q),
      )
    : departments;

  return (
    <aside
      className="flex min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm ring-1 ring-slate-900/[0.03] lg:max-h-[calc(100vh-14rem)]"
      aria-label="부서 필터"
    >
      <div className="shrink-0 space-y-3 border-b border-slate-100 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <i className="bx bx-filter-alt text-lg" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900">부서 선택</h2>
            <p className="text-[11px] font-medium text-slate-500">
              직무(부서)명으로 검색할 수 있어요
            </p>
          </div>
        </div>

        <label className="relative block">
          <span className="sr-only">부서 이름 검색</span>
          <i
            className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={filterText}
            onChange={(e) => onFilterTextChange(e.target.value)}
            placeholder="부서 이름 검색…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none ring-indigo-500/0 transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
        <ul className="space-y-1">
          {filtered.length === 0 ? (
            <li className="rounded-xl px-3 py-8 text-center">
              <i className="bx bx-folder-open mb-2 text-3xl text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">
                검색 결과가 없습니다
              </p>
            </li>
          ) : (
            filtered.map((dept) => {
              const selected = selectedDepartmentId === dept.positionId;
              return (
                <li key={dept.positionId}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectDepartment(dept.positionId)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition sm:px-3.5 sm:py-3.5 ${
                      selected
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-300/30"
                        : "text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                          selected
                            ? "bg-white/20 text-white"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        <i className="bx bx-buildings" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-bold ${
                            selected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {dept.positionName}
                        </span>
                        <span
                          className={`mt-0.5 block text-[11px] font-medium ${
                            selected ? "text-indigo-100" : "text-slate-400"
                          }`}
                        >
                          ID {dept.positionId}
                        </span>
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2">
                      <span
                        className={`tabular-nums text-sm font-black ${
                          selected ? "text-white" : "text-indigo-600"
                        }`}
                        title="저장된 질문 수"
                      >
                        {isQuestionCountLoading ? (
                          <span
                            className={`inline-block h-4 w-8 shrink-0 animate-pulse rounded ${
                              selected ? "bg-white/35" : "bg-slate-200/90"
                            }`}
                            aria-hidden
                          />
                        ) : (
                          <>
                            {questionCountByDepartmentId[dept.positionId] ?? 0}
                            <span
                              className={`ml-0.5 text-[11px] font-bold ${
                                selected ? "text-indigo-100" : "text-slate-400"
                              }`}
                            >
                              개
                            </span>
                          </>
                        )}
                      </span>
                      {selected ? (
                        <i className="bx bx-check text-xl" aria-hidden />
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </aside>
  );
}
