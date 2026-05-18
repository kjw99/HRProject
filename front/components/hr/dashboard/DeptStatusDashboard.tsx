"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import AssignInterviewerModal from "./AssignInterviewerModal";
import DeptInterviewModal from "./DeptInterviewModal";
import { DeptStatus } from "@/types/hr";
import { deptStatusApi } from "@/lib/hr/dept-status.client";
import DeptStatusCard from "./dept-status/DeptStatusCard";
import DeptStatusFilterBar from "./dept-status/DeptStatusFilterBar";
import DeptStatusRefreshButton from "./dept-status/DeptStatusRefreshButton";
import type { UpcomingInterview } from "./dept-status/types";

export type { UpcomingInterview } from "./dept-status/types";

interface DeptStatusProps {
  initialData: DeptStatus[];
}

export default function DeptStatusDashboard({ initialData }: DeptStatusProps) {
  const [items, setItems] = useState<DeptStatus[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState<string>("ALL");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState<UpcomingInterview | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeptName, setSelectedDeptName] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initialData);
    setPage(1);
    setHasMore(true);
  }, [initialData]);

  const progressOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      set.add(item.currentProgress);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "ko"));
  }, [items]);

  const displayItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !item.deptName.toLowerCase().includes(q)) return false;
      if (progressFilter !== "ALL" && item.currentProgress !== progressFilter)
        return false;
      return true;
    });
  }, [items, searchQuery, progressFilter]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || progressFilter !== "ALL";

  const resetFilters = () => {
    setSearchQuery("");
    setProgressFilter("ALL");
  };

  const handleRefresh = async () => {
    if (isRefreshing || isLoadingMore) return;

    setIsRefreshing(true);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const next = await deptStatusApi.fetchRecruitmentStatus();
      setItems(next);
      setPage(1);
      setHasMore(true);
    } catch {
      toast.error("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.", {
        duration: 2800,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchMoreData = useCallback(async () => {
    if (isLoadingMore || !hasMore || isRefreshing) return;
    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const depts = [
      "인프라팀",
      "플랫폼개발팀",
      "브랜드마케팅팀",
      "글로벌영업팀",
      "HR운영팀",
    ];
    const progress = [
      "1차 실무 면접",
      "2차 컬쳐핏 면접",
      "최종 임원 면접",
      "서류 심사 중",
    ];

    const newItems: DeptStatus[] = Array.from({ length: 4 }).map((_, i) => ({
      id: `dept-mock-${page}-${i}`,
      deptName: depts[Math.floor(Math.random() * depts.length)],
      currentProgress: `${progress[Math.floor(Math.random() * progress.length)]} 진행 중`,
      experienced: {
        intervieweeCount: Math.floor(Math.random() * 10),
        applicantCount: Math.floor(Math.random() * 100) + 20,
      },
      newcomer: {
        intervieweeCount: Math.floor(Math.random() * 5),
        applicantCount: Math.floor(Math.random() * 200) + 50,
      },
      lastUpdated: new Date().toISOString(),
    }));

    setItems((prev) => [...prev, ...newItems]);
    setPage((prev) => {
      const next = prev + 1;
      if (prev >= 4) setHasMore(false);
      return next;
    });
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, page, isRefreshing]);

  useEffect(() => {
    const canLoadMore = !hasActiveFilters || displayItems.length > 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isRefreshing &&
          canLoadMore
        ) {
          void fetchMoreData();
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [
    fetchMoreData,
    hasMore,
    isLoadingMore,
    isRefreshing,
    hasActiveFilters,
    displayItems.length,
  ]);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:rounded-[24px]">
      <div className="shrink-0 rounded-t-2xl border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 py-4 sm:rounded-t-[24px] sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <h2 className="flex items-center gap-2.5 text-base font-black text-slate-800 sm:text-lg">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <i className="bx bx-buildings text-lg" />
              </div>
              <span className="truncate">부서별 채용 근황</span>
            </h2>
            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 shadow-sm">
              <i className="bx bx-show text-indigo-500" />
              표시 {displayItems.length}
              <span className="text-slate-300">/</span>
              {items.length}
            </span>
          </div>
          <DeptStatusRefreshButton
            isRefreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
          />
        </div>
      </div>

      <DeptStatusFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        progressFilter={progressFilter}
        onProgressChange={setProgressFilter}
        progressOptions={progressOptions}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div
        className="hide-scrollbar flex-1 overflow-y-auto overscroll-y-contain bg-slate-50/20 p-4 sm:p-6"
        ref={scrollContainerRef}
      >
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-inner">
              <i className="bx bx-filter-alt text-3xl text-slate-300" />
            </div>
            <p className="text-sm font-black text-slate-600">
              조건에 맞는 부서가 없습니다
            </p>
            <p className="mt-1 max-w-xs text-xs font-medium text-slate-400">
              검색어·진행 단계를 바꾸거나 필터를 초기화해 보세요.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-[11px] font-black text-indigo-700 transition hover:bg-indigo-100"
              >
                <i className="bx bx-reset" />
                필터 초기화
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
            {displayItems.map((item) => (
              <DeptStatusCard
                key={item.id}
                item={item}
                onOpenDetail={(name) => {
                  setSelectedDeptName(name);
                  setIsDetailModalOpen(true);
                }}
                onOpenAssign={(data) => {
                  setAssignData(data);
                  setIsAssignModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        <div ref={loaderRef} className="flex w-full justify-center py-8">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-sm font-black text-indigo-600">
              <i className="bx bx-loader-alt bx-spin" />
              로딩 중
            </div>
          ) : (
            !hasMore &&
            displayItems.length > 0 && (
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                모든 부서의 근황을 불러왔습니다
              </div>
            )
          )}
        </div>
      </div>

      <AssignInterviewerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        interviewData={assignData}
      />

      <DeptInterviewModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        deptName={selectedDeptName}
      />
    </div>
  );
}
