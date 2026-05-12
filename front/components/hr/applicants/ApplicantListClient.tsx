"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Applicant } from "@/types/applicant";
import CriteriaModal from "./CriteriaModal";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  FilterFn,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { fetchApplicants } from "@/lib/hr/interview.client";

const DEPARTMENTS = [
  "ALL",
  "개발팀",
  "디자인팀",
  "마케팅팀",
  "영업팀",
  "인사팀",
];
const columnHelper = createColumnHelper<Applicant>();

// 하이픈 무시 및 이름/연락처 동시 검색 필터
const fuzzyFilter: FilterFn<Applicant> = (row, columnId, value) => {
  const searchKeyword = (value as string).toLowerCase().trim();
  if (!searchKeyword) return true;

  const name = row.original.name.toLowerCase();
  const phone = row.original.phone;

  if (name.includes(searchKeyword)) return true;

  const cleanPhone = phone.replace(/-/g, "");
  const cleanSearchKeyword = searchKeyword.replace(/-/g, "");

  if (cleanSearchKeyword && cleanPhone.includes(cleanSearchKeyword))
    return true;

  return false;
};

export default function ApplicantListClient() {
  const [data, setData] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 검색 및 필터 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [criteriaFilter, setCriteriaFilter] = useState<"ALL" | "HAS" | "NONE">(
    "ALL",
  );

  // 테이블 정렬 상태
  const [sorting, setSorting] = useState<SortingState>([]);

  // 하위 우대조건 상세 모달 상태
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const res = await fetchApplicants(selectedDept);
      setData(res.content);
      setIsLoading(false);
    };
    loadData();
  }, [selectedDept]);

  // 클라이언트 단에서 우대조건 유무 필터링 적용
  const filteredData = useMemo(() => {
    if (criteriaFilter === "HAS")
      return data.filter((d) => d.preferredCriteria.length > 0);
    if (criteriaFilter === "NONE")
      return data.filter((d) => d.preferredCriteria.length === 0);
    return data;
  }, [data, criteriaFilter]);

  // 스마트 필터 전환 핸들러
  const handleCriteriaFilterChange = (filter: "ALL" | "HAS" | "NONE") => {
    setCriteriaFilter(filter);
    if (filter === "HAS") {
      // 우대조건 보유를 누르면 기본적으로 '많은 순(내림차순)'으로 정렬
      setSorting([{ id: "preferredCriteria", desc: true }]);
    } else {
      setSorting([]);
    }
  };

  /* ==========================================
       TanStack Table 컬럼 정의
    ========================================== */
  const columns = useMemo(
    () => [
      columnHelper.accessor("experienceLevel", {
        header: "경력/신입",
        enableSorting: false,
        cell: (info) => {
          const val = info.getValue();
          const colorMap: Record<string, string> = {
            신입: "bg-emerald-100 text-emerald-700",
            경력: "bg-indigo-100 text-indigo-700",
            무관: "bg-slate-100 text-slate-600",
          };
          return (
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest ${colorMap[val]}`}
            >
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "이름",
        enableSorting: false,
        cell: (info) => (
          <span className="font-black text-slate-800">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "연락처",
        enableSorting: false,
        cell: (info) => (
          <span className="text-sm font-medium text-slate-500">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("appliedPosition", {
        header: "지원 직무",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold mb-0.5">
              {row.original.department}
            </span>
            <span className="text-sm font-bold text-slate-700">
              {row.original.appliedPosition}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "합격 여부",
        enableSorting: false,
        cell: (info) => {
          const val = info.getValue();
          let styles = "bg-slate-100 text-slate-600 border-slate-200";
          if (val === "합격")
            styles = "bg-emerald-50 text-emerald-600 border-emerald-200";
          if (val === "불합격")
            styles = "bg-rose-50 text-rose-600 border-rose-200";
          if (val === "면접 진행 중")
            styles = "bg-blue-50 text-blue-600 border-blue-200";
          return (
            <span
              className={`px-3 py-1.5 border rounded-lg text-xs font-black ${styles}`}
            >
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor("preferredCriteria", {
        id: "preferredCriteria",
        header: "우대조건 충족",
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          return (
            rowA.original.preferredCriteria.length -
            rowB.original.preferredCriteria.length
          );
        },
        cell: ({ row }) => {
          const criteria = row.original.preferredCriteria;
          if (criteria.length === 0)
            return (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50/80 border border-slate-100/50 text-slate-400 rounded-lg text-[11px] font-medium w-fit cursor-default">
                <i className="bx bx-minus-circle text-base opacity-60"></i>
                <span>해당 없음</span>
              </div>
            );
          return (
            <button
              onClick={() => {
                setSelectedApplicant(row.original);
                setIsCriteriaModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-100 hover:border-indigo-200 transition-colors group"
            >
              <i className="bx bx-certification text-base"></i>
              <span>{criteria.length}건 충족</span>
              <i className="bx bx-search-alt text-indigo-400 group-hover:text-indigo-600 ml-1"></i>
            </button>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: fuzzyFilter,
    state: {
      globalFilter: searchKeyword,
      sorting,
    },
    onGlobalFilterChange: setSearchKeyword,
    onSortingChange: setSorting,
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* 상단 컨트롤 패널 */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
        {/* 좌측: 타이틀 영역 */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <i className="bx bx-group text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">지원자 리스트</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              총 {filteredData.length}명의 지원자가 필터링되었습니다.
            </p>
          </div>
        </div>

        {/* 우측: 컨트롤 툴바 */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full xl:w-auto">
          {/* 1. 검색창 */}
          <div className="relative w-full lg:w-56 shrink-0">
            <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
            <input
              type="text"
              placeholder="이름/연락처 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-11 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <i className="bx bx-x-circle text-lg"></i>
              </button>
            )}
          </div>

          {/* 💡 2. 우대조건 그룹 (알림판 툴팁 UI 적용) */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto shrink-0 border border-slate-200 h-11 relative">
            <button
              onClick={() => handleCriteriaFilterChange("ALL")}
              className={`flex-1 lg:px-4 py-1.5 text-[11px] whitespace-nowrap font-black tracking-widest rounded-lg transition-all ${criteriaFilter === "ALL" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              전체
            </button>

            {/* 💡 2-1. 우대조건 보유 영역 (relative wrapper) */}
            <div className="relative flex flex-1">
              <button
                onClick={() => handleCriteriaFilterChange("HAS")}
                className={`w-full lg:px-4 py-1.5 text-[11px] whitespace-nowrap font-black tracking-widest rounded-lg transition-all ${criteriaFilter === "HAS" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                우대조건 보유
              </button>

              {/* 💡 2-2. 동동 떠오르는 다크 테마 알림판 (Tooltip) */}
              {criteriaFilter === "HAS" && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-800 p-1.5 rounded-2xl shadow-xl z-20 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap border border-slate-700">
                  {/* 말풍선 꼬리 (Triangle) */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-slate-800 border-b border-r border-slate-700 rotate-45 rounded-sm"></div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSorting([{ id: "preferredCriteria", desc: true }]);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-black tracking-widest rounded-xl transition-all flex items-center gap-1 relative z-10 ${sorting[0]?.desc === true ? "bg-indigo-500 text-white shadow-inner" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
                  >
                    <i className="bx bx-sort-down text-sm"></i> 많은 순
                  </button>

                  <div className="w-px h-3 bg-slate-600 mx-0.5 relative z-10"></div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSorting([{ id: "preferredCriteria", desc: false }]);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-black tracking-widest rounded-xl transition-all flex items-center gap-1 relative z-10 ${sorting[0]?.desc === false ? "bg-indigo-500 text-white shadow-inner" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
                  >
                    <i className="bx bx-sort-up text-sm"></i> 적은 순
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleCriteriaFilterChange("NONE")}
              className={`flex-1 lg:px-4 py-1.5 text-[11px] whitespace-nowrap font-black tracking-widest rounded-lg transition-all ${criteriaFilter === "NONE" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              미보유
            </button>
          </div>

          {/* 3. 부서 필터 드롭다운 */}
          <div className="relative w-full lg:w-44 shrink-0 h-11">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-full flex items-center justify-between px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <i className="bx bx-building text-slate-400 text-base shrink-0"></i>
                <span className="truncate">
                  {selectedDept === "ALL" ? "전체 부서 보기" : selectedDept}
                </span>
              </div>
              <i
                className={`bx bx-chevron-down text-lg text-slate-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              ></i>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDept(dept);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                                  ${selectedDept === dept ? "bg-indigo-50 text-indigo-700 font-black" : "text-slate-600 hover:bg-slate-50 font-medium"}`}
                    >
                      {dept === "ALL" ? "전체 부서" : dept}
                      {selectedDept === dept && (
                        <i className="bx bx-check text-xl text-indigo-600"></i>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 테이블 렌더링 영역 */}
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden relative min-h-[400px]">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="bg-slate-50/80 border-b border-slate-200"
                >
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className={`px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap transition-colors
                        ${h.column.getCanSort() ? "cursor-pointer hover:text-indigo-600 select-none group" : ""}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && (
                          <span className="text-sm flex flex-col">
                            {h.column.getIsSorted() === "asc" ? (
                              <i className="bx bx-up-arrow-alt text-indigo-600"></i>
                            ) : h.column.getIsSorted() === "desc" ? (
                              <i className="bx bx-down-arrow-alt text-indigo-600"></i>
                            ) : (
                              <i className="bx bx-sort text-slate-300 group-hover:text-indigo-400"></i>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr
                    key={`skeleton-${idx}`}
                    className="animate-pulse bg-white"
                  >
                    <td className="px-6 py-5">
                      <div className="h-6 w-12 bg-slate-200/70 rounded-md"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-5 w-16 bg-slate-200/70 rounded"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-28 bg-slate-200/70 rounded"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3 w-16 bg-slate-200/70 rounded"></div>
                        <div className="h-4 w-24 bg-slate-200/70 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-7 w-20 bg-slate-200/70 rounded-lg"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-8 w-24 bg-slate-200/70 rounded-lg"></div>
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-32 text-center text-slate-400 font-medium"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <i className="bx bx-ghost text-3xl text-slate-300"></i>
                    </div>
                    <p className="text-sm font-bold text-slate-500">
                      조건에 일치하는 지원자가 없습니다.
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((c) => (
                      <td key={c.id} className="px-6 py-5 whitespace-nowrap">
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CriteriaModal
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        applicant={selectedApplicant}
      />
    </div>
  );
}
