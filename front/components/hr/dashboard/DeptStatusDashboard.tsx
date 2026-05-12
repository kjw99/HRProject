// src/components/hr/dashboard/DeptStatusDashboard.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AssignInterviewerModal from "./AssignInterviewerModal";
import DeptInterviewModal from "./DeptInterviewModal";
import { DeptStatus } from "@/types/hr";

export interface UpcomingInterview {
  id: string;
  date: string;
  team: string;
  round: string;
  expType: "신입" | "경력" | "무관";
  intervieweeCount: number;
  applicantCount: number;
}

interface DeptStatusProps {
  initialData: DeptStatus[];
}

export default function DeptStatusDashboard({ initialData }: DeptStatusProps) {
  const [items, setItems] = useState<DeptStatus[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 💡 1. 스크롤 가능한 컨테이너를 제어하기 위한 Ref 생성
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState<UpcomingInterview | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeptName, setSelectedDeptName] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
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
    setPage((prev) => prev + 1);
    setIsLoading(false);
    if (page >= 4) setHasMore(false);
  }, [isLoading, hasMore, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) fetchMoreData();
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchMoreData, hasMore, isLoading]);

  // 💡 2. 새로고침 시 스크롤을 최상단으로 올리는 로직 추가
  const handleRefresh = async () => {
    if (isLoading) return;

    setIsLoading(true);

    // ✅ 스크롤 컨테이너의 위치를 부드럽게(smooth) 맨 위로 이동
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    setPage(1);
    setHasMore(true);
    setItems(initialData);

    setIsLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[24px] shadow-sm flex flex-col h-[600px] w-full relative">
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/30 rounded-t-[24px]">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <i className="bx bx-buildings text-lg"></i>
          </div>
          부서별 채용 근황
        </h2>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`group flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
            ${
              isLoading
                ? "bg-indigo-50 border border-indigo-200 text-indigo-600"
                : "bg-white border border-slate-200 text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
            }`}
        >
          <i
            className={`bx bx-refresh text-base transition-transform duration-500 
            ${isLoading ? "animate-spin" : "group-hover:rotate-180"}`}
          ></i>
          {isLoading ? "Updating..." : "Live Update"}
        </button>
      </div>

      {/* 💡 3. 스크롤 영역에 Ref 연결 */}
      <div
        ref={scrollContainerRef}
        className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1 bg-slate-50/20"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedDeptName(item.deptName);
                setIsDetailModalOpen(true);
              }}
              className="group border border-slate-200 bg-white rounded-[20px] p-5 transition-all duration-300 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer relative"
            >
              <i className="bx bx-right-top-arrow-circle absolute right-4 top-4 text-2xl text-slate-200 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-all duration-300"></i>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="font-black text-base text-slate-800 mb-1 flex items-center gap-2">
                    {item.deptName}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-xs font-bold text-indigo-600">
                      {item.currentProgress}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssignData({
                      id: item.id,
                      date: item.lastUpdated,
                      team: item.deptName,
                      round: item.currentProgress,
                      expType: "무관",
                      intervieweeCount:
                        item.experienced.intervieweeCount +
                        item.newcomer.intervieweeCount,
                      applicantCount:
                        item.experienced.applicantCount +
                        item.newcomer.applicantCount,
                    });
                    setIsAssignModalOpen(true);
                  }}
                  className="shrink-0 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-[11px] font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center gap-1 border border-slate-200 shadow-sm"
                >
                  <i className="bx bx-user-plus text-sm"></i> 면접관 추가
                </button>
              </div>

              <div className="space-y-2.5 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  가장 최근 일정 기준
                </p>

                <div className="flex items-center justify-between bg-slate-50/80 rounded-xl p-3 border border-slate-100/50">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full"></div>{" "}
                    경력직
                  </span>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        면접 대상
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {item.experienced.intervieweeCount}명
                      </span>
                    </div>
                    <div className="flex flex-col items-end border-l border-slate-200 pl-4">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        전체 지원
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {item.experienced.applicantCount}명
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50/80 rounded-xl p-3 border border-slate-100/50">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <div className="w-1.5 h-3 bg-emerald-500 rounded-full"></div>{" "}
                    신입(인턴)
                  </span>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        면접 대상
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {item.newcomer.intervieweeCount}명
                      </span>
                    </div>
                    <div className="flex flex-col items-end border-l border-slate-200 pl-4">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        전체 지원
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {item.newcomer.applicantCount}명
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={loaderRef} className="py-8 flex justify-center w-full">
          {isLoading ? (
            <div className="flex items-center gap-2 text-indigo-600 font-black text-sm">
              <i className="bx bx-loader-alt bx-spin"></i> 로딩 중
            </div>
          ) : (
            !hasMore && (
              <div className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
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
