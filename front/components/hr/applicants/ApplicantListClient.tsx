"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { deleteApplicant, updateApplicant } from "@/lib/hr/interview.client";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import type { Applicant } from "@/types/applicant";
import type { CriteriaFilter } from "@/types/hr-ui";
import ApplicantDetailModal from "./ApplicantDetailModal";
import ApplicantDeleteConfirmModal from "./ApplicantDeleteConfirmModal";
import ApplicantEditModal from "./ApplicantEditModal";
import CandidateMailComposerModal from "./CandidateMailComposerModal";
import CriteriaModal from "./CriteriaModal";

interface ApplicantListClientProps {
  initialData: Applicant[];
}

const columnHelper = createColumnHelper<Applicant>();

const getApplicantStatusTone = (value: string) => {
  if (value.includes("합격")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value.includes("불합격")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (value.includes("진행")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
};

const getExperienceTone = (value: string) => {
  if (value.includes("신입")) return "bg-emerald-100 text-emerald-700";
  if (value.includes("경력")) return "bg-indigo-100 text-indigo-700";
  return "bg-slate-100 text-slate-600";
};

const getPositionLabel = (applicant: Applicant) => {
  const addressParts = applicant.address.split(")");
  return addressParts[1]?.trim() || `공고 #${applicant.position_id}`;
};

export default function ApplicantListClient({
  initialData,
}: ApplicantListClientProps) {
  const [data, setData] = useState<Applicant[]>(initialData);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [criteriaFilter, setCriteriaFilter] = useState<CriteriaFilter>("ALL");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const [mailTarget, setMailTarget] = useState<Applicant | null>(null);
  const [detailTarget, setDetailTarget] = useState<Applicant | null>(null);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().replace(/-/g, "");
      result = result.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(keyword);
        const phoneMatch = (item.phone || "").replace(/-/g, "").includes(keyword);
        const emailMatch = (item.email || "").toLowerCase().includes(keyword);
        return nameMatch || phoneMatch || emailMatch;
      });
    }

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
  }, [criteriaFilter, data, searchKeyword]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("experience_level", {
        header: "구분",
        enableSorting: false,
        cell: (info) => (
          <span
            className={`rounded-md px-2.5 py-1 text-[10px] font-black tracking-widest ${getExperienceTone(
              String(info.getValue()),
            )}`}
          >
            {String(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "지원자",
        enableSorting: false,
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-black text-slate-800">{info.getValue()}</span>
            <span className="text-[10px] font-medium text-slate-400">
              {info.row.original.date_of_birth}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "contact",
        header: "연락처",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-600">
              {row.original.phone || "-"}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {row.original.email || "이메일 미등록"}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "position",
        header: "지원 정보",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="mb-0.5 text-xs font-bold text-slate-400">
              공고 ID: {row.original.position_id}
            </span>
            <span className="max-w-[200px] truncate text-sm font-bold text-slate-700">
              {getPositionLabel(row.original)}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "전형 상태",
        cell: ({ row }) => {
          const label = `${row.original.application_status} (${row.original.final_status})`;
          return (
            <span
              className={`w-fit rounded-lg border px-3 py-1.5 text-xs font-black ${getApplicantStatusTone(
                String(row.original.final_status),
              )}`}
            >
              {label}
            </span>
          );
        },
      }),
      columnHelper.accessor("meets_preferred_criteria", {
        id: "meets_preferred_criteria",
        header: "우대 조건",
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.meets_preferred_criteria?.length || 0) -
          (rowB.original.meets_preferred_criteria?.length || 0),
        cell: ({ row }) => {
          const criteria = row.original.meets_preferred_criteria || [];
          if (criteria.length === 0) {
            return (
              <div className="flex w-fit cursor-default items-center gap-1.5 rounded-lg bg-slate-50/80 px-3 py-1.5 text-[11px] font-medium text-slate-400">
                <i className="bx bx-minus-circle text-base opacity-60" />
                <span>해당 없음</span>
              </div>
            );
          }

          return (
            <button
              type="button"
              onClick={() => {
                setSelectedApplicant(row.original);
                setIsCriteriaModalOpen(true);
              }}
              className="group flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              <i className="bx bx-certification text-base" />
              <span>{criteria.length}개 충족</span>
              <i className="bx bx-search-alt ml-1 text-indigo-400 group-hover:text-indigo-600" />
            </button>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "액션",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDetailTarget(row.original);
                setIsDetailModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100"
            >
              <i className="bx bx-user-pin" />
              상세
            </button>
            <button
              type="button"
              onClick={() => {
                setDetailTarget(row.original);
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
            >
              <i className="bx bx-edit" />
              수정
            </button>
            <button
              type="button"
              onClick={() => {
                setMailTarget(row.original);
                setIsMailModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800"
            >
              <i className="bx bx-envelope" />
              메일 보내기
            </button>
            <button
              type="button"
              onClick={() => {
                setDetailTarget(row.original);
                setIsDeleteModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100"
            >
              <i className="bx bx-trash" />
              삭제
            </button>
          </div>
        ),
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

  const visibleCount = table.getRowModel().rows.length;

  const handleSaveApplicant = async (candidateId: number, payload: Parameters<typeof updateApplicant>[1]) => {
    try {
      const updated = await updateApplicant(candidateId, payload);
      setData((prev) =>
        prev.map((item) =>
          item.candidate_id === candidateId ? updated : item,
        ),
      );
      toast.success("지원자 정보가 수정되었습니다.");
      setIsEditModalOpen(false);
      setDetailTarget(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "지원자 정보 수정 중 오류가 발생했습니다."),
      );
    }
  };

  const handleDeleteApplicant = async () => {
    if (!detailTarget) return;

    setIsDeleting(true);
    try {
      const response = await deleteApplicant(detailTarget.candidate_id);
      setData((prev) =>
        prev.filter((item) => item.candidate_id !== detailTarget.candidate_id),
      );
      toast.success(response.message);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      setDetailTarget(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "지원자 삭제 중 오류가 발생했습니다."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <i className="bx bx-group text-2xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600">
              <i className="bx bx-filter-alt mr-1 text-indigo-500" />
              필터 · 검색
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 lg:flex-row lg:items-center xl:w-auto">
          <div className="relative w-full shrink-0 lg:w-72">
            <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="text"
              placeholder="이름, 전화번호, 이메일 검색"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex h-11 rounded-xl border border-slate-200 bg-slate-100 p-1">
            {(["ALL", "HAS", "NONE"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCriteriaFilter(filter)}
                className={`flex-1 whitespace-nowrap rounded-lg px-4 py-1.5 text-[11px] font-black tracking-widest transition-all ${
                  criteriaFilter === filter
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter === "ALL"
                  ? "전체"
                  : filter === "HAS"
                    ? "우대 조건 보유"
                    : "우대 조건 없음"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="text-sm font-bold text-slate-500">
            현재 {visibleCount}명 표시 중
          </p>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            테이블 헤더 클릭으로 정렬
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-slate-200 bg-slate-50/80"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:text-indigo-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() && (
                          <i
                            className={`bx bx-sort-${
                              header.column.getIsSorted() === "asc"
                                ? "up"
                                : "down"
                            } text-indigo-600`}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-24 text-center text-slate-400"
                  >
                    조건에 맞는 지원자가 없습니다.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.original.candidate_id}
                    className="group transition-colors hover:bg-slate-50/60"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap px-6 py-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

      <CandidateMailComposerModal
        isOpen={isMailModalOpen}
        onClose={() => {
          setIsMailModalOpen(false);
          setMailTarget(null);
        }}
        applicant={mailTarget}
      />

      <ApplicantDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailTarget(null);
        }}
        applicant={detailTarget}
        onApplicantUpdated={(updated) => {
          setData((prev) =>
            prev.map((item) =>
              item.candidate_id === updated.candidate_id ? updated : item,
            ),
          );
          setDetailTarget(updated);
        }}
        onApplicantDeleted={(candidateId) => {
          setData((prev) =>
            prev.filter((item) => item.candidate_id !== candidateId),
          );
          setIsDetailModalOpen(false);
          setDetailTarget(null);
        }}
      />

      <ApplicantEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setDetailTarget(null);
        }}
        applicant={detailTarget}
        onSave={(payload) =>
          detailTarget
            ? handleSaveApplicant(detailTarget.candidate_id, payload)
            : Promise.resolve()
        }
      />

      <ApplicantDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteModalOpen(false);
          setDetailTarget(null);
        }}
        applicant={detailTarget}
        onConfirm={handleDeleteApplicant}
        isDeleting={isDeleting}
      />
    </div>
  );
}
