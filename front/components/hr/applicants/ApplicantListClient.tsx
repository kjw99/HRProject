"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Applicant, ApplicantListResponse } from "@/types/applicant";
import CriteriaModal from "./CriteriaModal";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
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

export default function ApplicantListClient({
  initialData,
}: {
  initialData: Applicant[];
}) {
  const [data, setData] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 필터링 및 테이블 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [criteriaFilter, setCriteriaFilter] = useState<"ALL" | "HAS" | "NONE">(
    "ALL",
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // 모달 상태
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );

  // 1. 데이터 로드 (부서 선택 시 재호출)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log(initialData);
        setData([...initialData] as Applicant[]);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedDept]);

  // 2. 통합 필터 로직 (검색어 + 우대조건)
  const filteredData = useMemo(() => {
    let result = [...data];

    // [A] 검색어 필터: 이름 혹은 연락처(하이픈 제거 비교)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().replace(/-/g, "");
      result = result.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(keyword);
        const phoneMatch = (item.phone || "")
          .replace(/-/g, "")
          .includes(keyword);
        return nameMatch || phoneMatch;
      });
    }

    // [B] 우대조건 필터
    if (criteriaFilter === "HAS") {
      result = result.filter(
        (item) => (item.meets_preferred_criteria?.length || 0) > 0,
      );
    } else if (criteriaFilter === "NONE") {
      result = result.filter(
        (item) => (item.meets_preferred_criteria?.length || 0) === 0,
      );
    }

    return result;
  }, [data, searchKeyword, criteriaFilter]);

  // 3. 우대조건 필터 변경 핸들러 (정렬 동시 제어)
  const handleCriteriaFilterChange = (filter: "ALL" | "HAS" | "NONE") => {
    setCriteriaFilter(filter);
    if (filter === "HAS") {
      setSorting([{ id: "meets_preferred_criteria", desc: true }]);
    } else {
      setSorting([]);
    }
  };

  /* ==========================================
        TanStack Table 컬럼 정의
    ========================================== */
  const columns = useMemo(
    () => [
      columnHelper.accessor("experience_level", {
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
              className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest ${colorMap[val] || "bg-slate-100"}`}
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
          <div className="flex flex-col">
            <span className="font-black text-slate-800">{info.getValue()}</span>
            <span className="text-[10px] text-slate-400 font-medium">
              {info.row.original.date_of_birth}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "연락처",
        enableSorting: false,
        cell: (info) => (
          <span className="text-sm font-medium text-slate-500">
            {info.getValue() || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("position_id", {
        header: "지원 정보",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold mb-0.5">
              ID: {row.original.position_id}
            </span>
            <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
              {row.original.address.split(")")[1]?.trim() || "지역 정보 없음"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("application_status", {
        header: "전형 단계",
        enableSorting: false,
        cell: (info) => {
          const val = info.getValue();
          const finalStatus = info.row.original.final_status;
          let styles = "bg-slate-100 text-slate-600 border-slate-200";
          if (finalStatus === "합격")
            styles = "bg-emerald-50 text-emerald-600 border-emerald-200";
          if (finalStatus === "불합격")
            styles = "bg-rose-50 text-rose-600 border-rose-200";
          if (finalStatus === "진행중")
            styles = "bg-blue-50 text-blue-600 border-blue-200";

          return (
            <span
              className={`px-3 py-1.5 border rounded-lg text-xs font-black w-fit ${styles}`}
            >
              {val} ({finalStatus})
            </span>
          );
        },
      }),
      columnHelper.accessor("meets_preferred_criteria", {
        id: "meets_preferred_criteria",
        header: "우대조건 충족",
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.meets_preferred_criteria?.length || 0) -
          (rowB.original.meets_preferred_criteria?.length || 0),
        cell: ({ row }) => {
          const criteria = row.original.meets_preferred_criteria || [];
          if (criteria.length === 0)
            return (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50/80 text-slate-400 rounded-lg text-[11px] font-medium w-fit cursor-default">
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors group"
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
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* 상단 툴바 */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <i className="bx bx-group text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">지원자 리스트</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              총 {filteredData.length}명이 필터링되었습니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full xl:w-auto">
          {/* 검색 필터 */}
          <div className="relative w-full lg:w-64 shrink-0">
            <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
            <input
              type="text"
              placeholder="이름 또는 연락처 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* 우대조건 탭 필터 */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 h-11 relative">
            {(["ALL", "HAS", "NONE"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => handleCriteriaFilterChange(filter)}
                className={`flex-1 px-4 py-1.5 text-[11px] whitespace-nowrap font-black tracking-widest rounded-lg transition-all ${
                  criteriaFilter === filter
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter === "ALL"
                  ? "전체"
                  : filter === "HAS"
                    ? "우대조건 보유"
                    : "미보유"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden relative min-h-[400px]">
        <div className="overflow-x-auto">
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
                      className={`px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest ${
                        h.column.getCanSort()
                          ? "cursor-pointer hover:text-indigo-600 select-none"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() && (
                          <i
                            className={`bx bx-sort-${h.column.getIsSorted() === "asc" ? "up" : "down"} text-indigo-600`}
                          ></i>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-20 text-slate-400 font-bold"
                  >
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-32 text-center text-slate-400"
                  >
                    조건에 일치하는 지원자가 없습니다.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.original.candidate_id}
                    className="hover:bg-slate-50/50 transition-colors group"
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

      {/* 상세 모달 */}
      <CriteriaModal
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        applicant={selectedApplicant}
      />
    </div>
  );
}
