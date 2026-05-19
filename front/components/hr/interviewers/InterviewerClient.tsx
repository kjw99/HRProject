"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ToastUI } from "@/components/ui/ToastUI";
import { interviewerApi } from "@/lib/hr/interviewers.client";
import {
  HrInterviewer,
  InterviewerPayload,
  InterviewRound,
} from "@/types/interviewer";
import { Position } from "@/types/position";
import DeleteConfirmModal from "../positions/DeleteConfirmModal";
import InterviewerFormModal from "./InterviewerFormModal";
import InterviewerTable from "./InterviewerTable";

type ApiError = {
  response?: {
    data?: {
      message?: string;
      detail?: string;
    };
  };
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;
  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.detail ||
    fallback
  );
};

export type InterviewerSortKey =
  | "interviewerName"
  | "interviewerEmail"
  | "positionName"
  | "interviewRound"
  | "createdAt";
export type SortOrder = "asc" | "desc";

interface InterviewerClientProps {
  initialData: HrInterviewer[];
  positions: Position[];
  /** 서버에서 내려준 전체 면접관 수(필터 전) */
  listTotalCount: number;
}

export default function InterviewerClient({
  initialData,
  positions,
  listTotalCount,
}: InterviewerClientProps) {
  const [interviewers, setInterviewers] = useState<HrInterviewer[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<number | "ALL">("ALL");
  const [roundFilter, setRoundFilter] = useState<InterviewRound | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<InterviewerSortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] =
    useState<HrInterviewer | null>(null);

  const router = useRouter();

  useEffect(() => {
    setInterviewers(initialData);
  }, [initialData]);

  const filteredAndSortedInterviewers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = interviewers;

    if (query) {
      result = result.filter((interviewer) =>
        [
          interviewer.interviewerName,
          interviewer.interviewerEmail,
          interviewer.positionName ?? "",
          interviewer.interviewRound ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    if (positionFilter !== "ALL") {
      result = result.filter(
        (interviewer) => interviewer.positionId === positionFilter,
      );
    }

    if (roundFilter !== "ALL") {
      result = result.filter(
        (interviewer) => interviewer.interviewRound === roundFilter,
      );
    }

    const pickValue = (item: HrInterviewer): number | string | null => {
      if (sortKey === "createdAt") {
        const time = new Date(item.createdAt).getTime();
        return Number.isFinite(time) ? time : null;
      }
      if (sortKey === "interviewRound") {
        const raw = item.interviewRound;
        if (!raw) return null;
        const matched = String(raw).match(/\d+/);
        return matched ? Number(matched[0]) : null;
      }
      const raw = item[sortKey];
      if (raw == null || raw === "") return null;
      return String(raw);
    };

    return [...result].sort((a, b) => {
      const valueA = pickValue(a);
      const valueB = pickValue(b);

      // null/빈값은 정렬 방향과 관계없이 항상 마지막에 노출
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1;
      if (valueB == null) return -1;

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      const stringA = String(valueA);
      const stringB = String(valueB);
      return sortOrder === "asc"
        ? stringA.localeCompare(stringB, "ko", { numeric: true })
        : stringB.localeCompare(stringA, "ko", { numeric: true });
    });
  }, [interviewers, positionFilter, roundFilter, searchQuery, sortKey, sortOrder]);

  const handleSort = (key: InterviewerSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortOrder("asc");
  };

  const handleSaveInterviewer = async (payload: InterviewerPayload) => {
    const duration = 1500;

    try {
      if (selectedInterviewer) {
        const updated = await interviewerApi.updateInterviewer(
          selectedInterviewer.interviewerId,
          payload,
        );
        setInterviewers((prev) =>
          prev.map((item) =>
            item.interviewerId === updated.interviewerId ? updated : item,
          ),
        );
        toast.custom(
          (t) => (
            <ToastUI t={t} message="면접관 정보가 수정되었습니다." duration={duration} />
          ),
          { duration },
        );
      } else {
        const created = await interviewerApi.createInterviewer(payload);
        setInterviewers((prev) => [created, ...prev]);
        toast.custom(
          (t) => (
            <ToastUI t={t} message="면접관이 추가되었습니다." duration={duration} />
          ),
          { duration },
        );
      }

      setIsFormModalOpen(false);
      setSelectedInterviewer(null);
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        "면접관 저장 중 오류가 발생했습니다.",
      );
      toast.error(errorMessage, { duration: 2000 });
    }
  };

  const handleDeleteInterviewer = async () => {
    if (!selectedInterviewer) return;

    try {
      const response = await interviewerApi.deleteInterviewer(
        selectedInterviewer.interviewerId,
      );
      setInterviewers((prev) =>
        prev.filter(
          (item) => item.interviewerId !== selectedInterviewer.interviewerId,
        ),
      );
      toast.custom(
        (t) => (
          <ToastUI
            t={t}
            message={response.message || "면접관이 삭제되었습니다."}
            duration={2000}
          />
        ),
        { duration: 2000 },
      );
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        "면접관 삭제 중 오류가 발생했습니다.",
      );
      toast.error(errorMessage, { duration: 2000 });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedInterviewer(null);
    }
  };

  const visibleCount = filteredAndSortedInterviewers.length;

  const sortOptions: { key: InterviewerSortKey; label: string }[] = [
    { key: "createdAt", label: "생성일" },
    { key: "interviewerName", label: "이름" },
    { key: "interviewerEmail", label: "이메일" },
    { key: "positionName", label: "담당 직무" },
    { key: "interviewRound", label: "차수" },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-[24px]">
      <div className="shrink-0 space-y-3 border-b border-slate-100 bg-linear-to-b from-slate-50/90 to-white p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-bold text-slate-500 sm:text-[13px]">
            <i className="bx bx-filter-alt text-indigo-500" />
            <span className="tabular-nums text-slate-700">
              총 {listTotalCount}명
            </span>
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span className="tabular-nums text-slate-600">
              표시 {visibleCount}명
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,11rem)_minmax(0,9rem)]">
            <div className="relative min-w-0">
              <i className="bx bx-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
              <input
                type="search"
                placeholder="이름, 이메일, 직무 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="relative min-w-0">
              <i className="bx bx-briefcase-alt pointer-events-none absolute left-3 top-1/2 z-1 -translate-y-1/2 text-slate-400" />
              <select
                value={positionFilter}
                onChange={(e) =>
                  setPositionFilter(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[13px] font-bold text-slate-600 shadow-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">전체 직무</option>
                {positions.map((position) => (
                  <option key={position.positionId} value={position.positionId}>
                    {position.positionName}
                  </option>
                ))}
              </select>
              <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
              <i className="bx bx-layer pointer-events-none absolute left-3 top-1/2 z-1 -translate-y-1/2 text-slate-400" />
              <select
                value={roundFilter}
                onChange={(e) =>
                  setRoundFilter(e.target.value as InterviewRound | "ALL")
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[13px] font-bold text-slate-600 shadow-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">전체 차수</option>
                <option value="1차">1차</option>
                <option value="2차">2차</option>
                <option value="3차">3차</option>
              </select>
              <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* 모바일·태블릿 전용 정렬 컨트롤 (데스크탑은 테이블 헤더 사용) */}
          <div className="flex items-stretch gap-2 lg:hidden">
            <div className="relative flex-1">
              <i className="bx bx-sort pointer-events-none absolute left-3 top-1/2 z-1 -translate-y-1/2 text-slate-400" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as InterviewerSortKey)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[13px] font-bold text-slate-600 shadow-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                aria-label="정렬 기준"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}순
                  </option>
                ))}
              </select>
              <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="flex shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12px] font-black text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600"
              aria-label={sortOrder === "asc" ? "오름차순" : "내림차순"}
              title={sortOrder === "asc" ? "오름차순" : "내림차순"}
            >
              <i
                className={`bx text-lg ${
                  sortOrder === "asc" ? "bx-sort-up" : "bx-sort-down"
                }`}
              />
              <span className="hidden sm:inline">
                {sortOrder === "asc" ? "오름차순" : "내림차순"}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedInterviewer(null);
              setIsFormModalOpen(true);
            }}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-black text-white shadow-md shadow-indigo-200/80 transition-all hover:bg-indigo-700 active:scale-[0.98] xl:self-center"
          >
            <i className="bx bx-user-plus text-lg leading-none" />
            <span className="whitespace-nowrap">면접관 추가</span>
          </button>

          <Link
            href="/hr/interviewers/communication"
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50 xl:self-center"
          >
            <i className="bx bx-send text-lg leading-none text-indigo-500" />
            <span className="whitespace-nowrap">초대 / 메일 운영</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <InterviewerTable
          interviewers={filteredAndSortedInterviewers}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={(interviewer) => {
            setSelectedInterviewer(interviewer);
            setIsFormModalOpen(true);
          }}
          onDelete={(interviewer) => {
            setSelectedInterviewer(interviewer);
            setIsDeleteModalOpen(true);
          }}
        />
      </div>

      <InterviewerFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedInterviewer(null);
        }}
        onSave={handleSaveInterviewer}
        initialData={selectedInterviewer}
        positions={positions}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteInterviewer}
        targetName={selectedInterviewer?.interviewerName || ""}
      />
    </div>
  );
}
