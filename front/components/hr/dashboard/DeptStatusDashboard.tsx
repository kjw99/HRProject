"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AssignInterviewerModal from "./AssignInterviewerModal";
import DeptInterviewModal, { DeptInterviewRecord } from "./DeptInterviewModal";
import { DeptStatus } from "@/types/hr";
import { deptStatusApi } from "@/lib/hr/dept-status.client";
import DeptStatusCard from "./dept-status/DeptStatusCard";
import DeptStatusFilterBar from "./dept-status/DeptStatusFilterBar";
import DeptStatusRefreshButton from "./dept-status/DeptStatusRefreshButton";
import type { UpcomingInterview } from "./dept-status/types";

export type { UpcomingInterview } from "./dept-status/types";

interface DeptStatusProps {
  initialData: DeptStatus[];
  interviewRecords?: DeptInterviewRecord[];
}

export default function DeptStatusDashboard({
  initialData,
  interviewRecords = [],
}: DeptStatusProps) {
  const [items, setItems] = useState<DeptStatus[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState<string>("ALL");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState<UpcomingInterview | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeptName, setSelectedDeptName] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  const progressOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) set.add(item.currentProgress);
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
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const next = await deptStatusApi.fetchRecruitmentStatus();
      setItems(next);
    } catch {
      toast.error("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:rounded-[24px]">
      <div className="shrink-0 rounded-t-2xl border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 py-4 sm:rounded-t-[24px] sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <h2 className="flex items-center gap-2.5 text-base font-black text-slate-800 sm:text-lg">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <i className="bx bx-buildings text-lg" />
              </div>
              <span className="truncate">부서별 채용 현황</span>
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

      <div className="hide-scrollbar flex-1 overflow-y-auto bg-slate-50/20 p-4 sm:p-6">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
            <p className="text-sm font-black text-slate-600">
              조건에 맞는 부서가 없습니다
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
        records={interviewRecords}
      />
    </div>
  );
}
