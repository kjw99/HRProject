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
import {
  buildDuplicateIdentityKey,
  findDuplicateIdentityKeys,
} from "@/lib/hr/parsing-mapper";
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

interface ApplicantPositionDisplay {
  label: string;
  isMissing: boolean;
  positionId: number | null;
}

function getApplicantPositionDisplay(
  applicant: Applicant,
): ApplicantPositionDisplay {
  const positionName = applicant.position_name?.trim();
  if (positionName) {
    return {
      label: positionName,
      isMissing: false,
      positionId: applicant.position_id,
    };
  }

  const hasPositionId =
    applicant.position_id != null && applicant.position_id > 0;

  if (hasPositionId) {
    return {
      label: `직무 ID ${applicant.position_id} (명칭 없음)`,
      isMissing: true,
      positionId: applicant.position_id,
    };
  }

  return {
    label: "지원 포지션 미지정",
    isMissing: true,
    positionId: null,
  };
}

function ApplicantPositionCell({ applicant }: { applicant: Applicant }) {
  const { label, isMissing, positionId } =
    getApplicantPositionDisplay(applicant);

  return (
    <div
      className={`flex max-w-[240px] flex-col gap-1 rounded-xl px-3 py-2 ${isMissing
        ? "border border-dashed border-rose-200 bg-rose-50/80 ring-1 ring-rose-100"
        : ""
        }`}
    >
      {positionId != null ? (
        <span
          className={`text-[10px] font-bold tabular-nums ${isMissing ? "text-rose-500" : "text-slate-400"
            }`}
        >
          공고 ID: {positionId}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
          <i className="bx bx-error-circle text-sm" />
          공고 ID 없음
        </span>
      )}
      <span
        className={`truncate text-sm font-bold leading-snug ${isMissing ? "text-rose-800" : "text-slate-700"
          }`}
        title={label}
      >
        {isMissing ? (
          <span className="inline-flex items-center gap-1">
            <i className="bx bx-briefcase-alt shrink-0 text-base opacity-80" />
            {label}
          </span>
        ) : (
          label
        )}
      </span>
    </div>
  );
}

const getDisplayApplicantName = (rawName: string): string => {
  return rawName
    .replace(/[\(\（][^\)\）]*[\)\）]/g, "")
    .replace(/\s+/g, "")
    .trim();
};

const isApplicantNameNormalized = (rawName: string): boolean => {
  return getDisplayApplicantName(rawName) !== rawName.trim();
};

const POSITION_FILTER_ALL = "__ALL__";
const POSITION_FILTER_MISSING = "__MISSING__";

interface ApplicantIssue {
  hasIssue: boolean;
  reasons: string[];
}

function getApplicantIssue(applicant: Applicant): ApplicantIssue {
  const reasons: string[] = [];

  if (isApplicantNameNormalized(applicant.name)) {
    reasons.push("이름 정제 필요");
  }
  if (getApplicantPositionDisplay(applicant).isMissing) {
    reasons.push("지원 공고 미지정");
  }
  const phone = (applicant.phone || "").trim();
  const email = (applicant.email || "").trim();
  if (!phone && !email) {
    reasons.push("연락처 누락");
  }

  return { hasIssue: reasons.length > 0, reasons };
}

export default function ApplicantListClient({
  initialData,
}: ApplicantListClientProps) {
  const [data, setData] = useState<Applicant[]>(initialData);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [criteriaFilter, setCriteriaFilter] = useState<CriteriaFilter>("ALL");
  const [positionFilter, setPositionFilter] =
    useState<string>(POSITION_FILTER_ALL);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [showProblemOnly, setShowProblemOnly] = useState(false);
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

  const duplicateIdentityKeys = useMemo(
    () =>
      findDuplicateIdentityKeys(
        data.map((item) => ({
          name: item.name,
          birth: item.date_of_birth,
          phone: item.phone,
          email: item.email,
        })),
      ),
    [data],
  );

  const positionOptions = useMemo(() => {
    const names = new Set<string>();
    for (const item of data) {
      const name = item.position_name?.trim();
      if (name) names.add(name);
    }
    return Array.from(names).sort((a, b) =>
      a.localeCompare(b, "ko", { numeric: true }),
    );
  }, [data]);

  useEffect(() => {
    if (
      positionFilter !== POSITION_FILTER_ALL &&
      positionFilter !== POSITION_FILTER_MISSING &&
      !positionOptions.includes(positionFilter)
    ) {
      setPositionFilter(POSITION_FILTER_ALL);
    }
  }, [positionFilter, positionOptions]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().replace(/-/g, "");
      result = result.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(keyword);
        const phoneMatch = (item.phone || "")
          .replace(/-/g, "")
          .includes(keyword);
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

    if (positionFilter === POSITION_FILTER_MISSING) {
      result = result.filter(
        (item) => getApplicantPositionDisplay(item).isMissing,
      );
    } else if (positionFilter !== POSITION_FILTER_ALL) {
      result = result.filter(
        (item) => (item.position_name?.trim() || "") === positionFilter,
      );
    }

    if (showDuplicatesOnly) {
      result = result.filter((item) =>
        duplicateIdentityKeys.has(
          buildDuplicateIdentityKey({
            name: item.name,
            birth: item.date_of_birth,
            phone: item.phone,
            email: item.email,
          }),
        ),
      );
    }

    if (showProblemOnly) {
      result = result.filter((item) => getApplicantIssue(item).hasIssue);
    }

    return result;
  }, [
    criteriaFilter,
    data,
    duplicateIdentityKeys,
    positionFilter,
    searchKeyword,
    showDuplicatesOnly,
    showProblemOnly,
  ]);

  const totalProblemCount = useMemo(
    () => data.filter((item) => getApplicantIssue(item).hasIssue).length,
    [data],
  );

  const totalDuplicateCount = useMemo(
    () =>
      data.filter((item) =>
        duplicateIdentityKeys.has(
          buildDuplicateIdentityKey({
            name: item.name,
            birth: item.date_of_birth,
            phone: item.phone,
            email: item.email,
          }),
        ),
      ).length,
    [data, duplicateIdentityKeys],
  );

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
            <span className="font-black text-slate-800">
              {getDisplayApplicantName(String(info.getValue()))}
            </span>
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
        cell: ({ row }) => <ApplicantPositionCell applicant={row.original} />,
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
              <span>{criteria.length}건 충족</span>
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
          <button
            type="button"
            onClick={() => {
              setDetailTarget(row.original);
              setIsDetailModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            title="상세에서 수정·메일·삭제를 진행할 수 있습니다"
          >
            <i className="bx bx-user-pin" />
            상세
          </button>
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

  const handleSaveApplicant = async (
    candidateId: number,
    payload: Parameters<typeof updateApplicant>[1],
  ) => {
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
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:gap-3 lg:justify-between">
        <div className="flex items-center gap-2 lg:shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <i className="bx bx-filter-alt text-lg" />
          </span>
          <p className="hidden text-[11px] font-black uppercase tracking-widest text-slate-500 lg:block">
            필터 · 검색
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-4 lg:w-auto lg:flex-none lg:flex-row lg:items-center">
          <div className="relative w-full shrink-0 lg:w-64">
            <i className="bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400" />
            <input
              type="text"
              placeholder="이름, 전화번호, 이메일 검색"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex h-10 rounded-xl border border-slate-200 bg-slate-100 p-1">
            {(["ALL", "HAS", "NONE"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCriteriaFilter(filter)}
                className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1 text-[11px] font-black tracking-widest transition-all ${criteriaFilter === filter
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

          <div className="relative h-10 lg:w-52">
            <i className="bx bx-briefcase-alt-2 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-indigo-500" />
            <select
              value={positionFilter}
              onChange={(event) => setPositionFilter(event.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-[11px] font-black tracking-widest text-slate-600 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              title="지원 공고(직무)별로 필터링"
            >
              <option value={POSITION_FILTER_ALL}>지원 공고: 전체</option>
              <option value={POSITION_FILTER_MISSING}>지원 공고: 미지정</option>
              {positionOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <i className="bx bx-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-slate-400" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-slate-500">
              현재 {visibleCount}명 표시 중
            </p>

            {totalProblemCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowProblemOnly((prev) => !prev)}
                aria-pressed={showProblemOnly}
                title={
                  showProblemOnly
                    ? "필터 해제: 모든 row 보기"
                    : "이름 정제 필요, 공고 미지정, 연락처 누락 등 문제 있는 row만 보기"
                }
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-black tracking-widest transition ${showProblemOnly
                  ? "bg-amber-200 text-amber-800 ring-1 ring-amber-300 shadow-inner"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
              >
                <i className="bx bx-error" />
                문제 row {totalProblemCount}건
                {showProblemOnly ? (
                  <i className="bx bx-filter-alt ml-0.5" />
                ) : null}
              </button>
            ) : null}

            {totalDuplicateCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowDuplicatesOnly((prev) => !prev)}
                aria-pressed={showDuplicatesOnly}
                title={
                  showDuplicatesOnly
                    ? "필터 해제: 모든 row 보기"
                    : "이름·생년월일·전화·이메일 기준 중복 의심 row만 보기"
                }
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-black tracking-widest transition ${showDuplicatesOnly
                  ? "bg-rose-200 text-rose-800 ring-1 ring-rose-300 shadow-inner"
                  : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                  }`}
              >
                <i className="bx bx-copy" />
                중복 {totalDuplicateCount}건
                {showDuplicatesOnly ? (
                  <i className="bx bx-filter-alt ml-0.5" />
                ) : null}
              </button>
            ) : null}
          </div>
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
                      className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 ${header.column.getCanSort()
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
                            className={`bx bx-sort-${header.column.getIsSorted() === "asc"
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
                table.getRowModel().rows.map((row) => {
                  const issue = getApplicantIssue(row.original);
                  const issueTitle = issue.hasIssue
                    ? `확인 필요: ${issue.reasons.join(", ")}`
                    : undefined;
                  return (
                    <tr
                      key={row.original.candidate_id}
                      title={issueTitle}
                      className={`group transition-colors hover:bg-slate-50/60 ${issue.hasIssue
                        ? "bg-amber-50/70 ring-1 ring-inset ring-amber-100"
                        : ""
                        }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="whitespace-nowrap px-6 py-5"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
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
