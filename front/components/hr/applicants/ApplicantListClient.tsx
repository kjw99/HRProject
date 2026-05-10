"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Applicant } from "@/types/applicant";
import CriteriaModal from "./CriteriaModal";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel, // 💡 1. 필터링 모델 추가 임포트
  FilterFn, // 💡 2. 커스텀 필터 타입 임포트
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

// 💡 3. 하이픈 무시 및 이름/연락처 동시 검색을 위한 커스텀 필터 함수
const fuzzyFilter: FilterFn<Applicant> = (row, columnId, value, addMeta) => {
  const searchKeyword = (value as string).toLowerCase().trim();
  if (!searchKeyword) return true;

  const name = row.original.name.toLowerCase();
  const phone = row.original.phone;

  // 이름에 검색어가 포함되어 있는지 확인
  if (name.includes(searchKeyword)) return true;

  // 연락처 하이픈 제거 후 비교 로직 (0101234와 010-1234 모두 매칭)
  const cleanPhone = phone.replace(/-/g, "");
  const cleanSearchKeyword = searchKeyword.replace(/-/g, "");

  if (cleanSearchKeyword && cleanPhone.includes(cleanSearchKeyword))
    return true;

  return false;
};

export default function ApplicantListClient() {
  const [data, setData] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 1. 검색어 상태 추가
  const [searchKeyword, setSearchKeyword] = useState("");

  // 필터 드롭다운 상태
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );

  // 데이터 패칭 로직 (부서 필터가 바뀔 때마다 실행)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const res = await fetchApplicants(selectedDept);
      setData(res.content);
      setIsLoading(false);
    };
    loadData();
  }, [selectedDept]);

  /* ==========================================
       TanStack Table 컬럼 정의
    ========================================== */
  const columns = useMemo(
    () => [
      columnHelper.accessor("experienceLevel", {
        header: "경력/신입",
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
        cell: (info) => (
          <span className="font-black text-slate-800">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "연락처",
        cell: (info) => (
          <span className="text-sm font-medium text-slate-500">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("appliedPosition", {
        header: "지원 직무",
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
      columnHelper.display({
        id: "preferredCriteria",
        header: "우대조건 충족",
        cell: ({ row }) => {
          const criteria = row.original.preferredCriteria;
          if (criteria.length === 0)
            return (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50/80 border border-slate-100/50 text-slate-400 rounded-lg text-xs font-medium w-fit cursor-default">
                {/* 💡 마이너스 또는 빈 원 형태의 아이콘을 써서 '비어있음'을 직관적으로 전달 */}
                <i className="bx bx-minus-circle text-base opacity-60"></i>
                <span>해당 없음</span>
              </div>
            );
          return (
            <button
              onClick={() => {
                setSelectedApplicant(row.original);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 hover:border-indigo-200 transition-colors group"
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // 필터 모델 적용
    globalFilterFn: fuzzyFilter, // 커스텀 필터 함수 적용
    state: {
      globalFilter: searchKeyword, // 검색어 상태 연결
    },
    onGlobalFilterChange: setSearchKeyword,
  });

  return (
    <div className="w-full space-y-6">
      {/* 💡 상단 헤더 및 컨트롤 패널 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
        {/* 좌측: 타이틀 영역 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <i className="bx bx-group text-2xl"></i>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">
              전체 지원자 관리
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              총 {data.length}명의 지원자가 있습니다.
            </p>
          </div>
        </div>

        {/* 우측: 컨트롤 영역 (검색창 + 부서 필터) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* 💡 검색 Input 영역 */}
          <div className="relative w-full sm:w-64 shrink-0">
            <i className="bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
            <input
              type="text"
              placeholder="이름 또는 연락처 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm placeholder:text-slate-400 font-medium"
            />
            {/* 검색어가 있을 때 텍스트 지우기 버튼 */}
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <i className="bx bx-x-circle text-lg"></i>
              </button>
            )}
          </div>

          {/* 기존 부서 필터 드롭다운 */}
          <div className="relative w-full sm:w-48 shrink-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <i className="bx bx-building text-slate-400 text-lg"></i>
                {selectedDept === "ALL" ? "전체 부서 보기" : selectedDept}
              </div>
              <i
                className={`bx bx-chevron-down text-lg text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
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

      {/* 💡 테이블 렌더링 영역 */}
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden relative">
        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg font-bold text-sm">
              <i className="bx bx-loader-alt bx-spin text-xl"></i> 데이터
              불러오는 중...
            </div>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="bg-slate-50/80 border-b border-slate-200"
                >
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* 💡 1. 로딩 중일 때: 스켈레톤 UI (5줄 렌더링) */}
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr
                    key={`skeleton-${idx}`}
                    className="animate-pulse bg-white"
                  >
                    {/* 경력/신입 뱃지 자리 */}
                    <td className="px-6 py-4">
                      <div className="h-6 w-12 bg-slate-200/70 rounded-md"></div>
                    </td>
                    {/* 이름 자리 */}
                    <td className="px-6 py-4">
                      <div className="h-5 w-16 bg-slate-200/70 rounded"></div>
                    </td>
                    {/* 연락처 자리 */}
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 bg-slate-200/70 rounded"></div>
                    </td>
                    {/* 지원 직무 자리 (두 줄) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3 w-16 bg-slate-200/70 rounded"></div>
                        <div className="h-4 w-24 bg-slate-200/70 rounded"></div>
                      </div>
                    </td>
                    {/* 합격 여부 뱃지 자리 */}
                    <td className="px-6 py-4">
                      <div className="h-7 w-20 bg-slate-200/70 rounded-lg"></div>
                    </td>
                    {/* 우대조건 버튼 자리 */}
                    <td className="px-6 py-4">
                      <div className="h-8 w-24 bg-slate-200/70 rounded-lg"></div>
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                /* 💡 2. 데이터가 없을 때 */
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-24 text-center text-slate-400 font-medium"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <i className="bx bx-ghost text-3xl text-slate-300"></i>
                    </div>
                    <p className="text-sm font-bold text-slate-500">
                      해당 부서에 일치하는 지원자가 없습니다.
                    </p>
                  </td>
                </tr>
              ) : (
                /* 💡 3. 데이터가 있을 때 정상 렌더링 */
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((c) => (
                      <td key={c.id} className="px-6 py-4 whitespace-nowrap">
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

      {/* 💡 우대조건 확인 모달 마운트 */}
      <CriteriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicant={selectedApplicant}
      />
    </div>
  );
}
