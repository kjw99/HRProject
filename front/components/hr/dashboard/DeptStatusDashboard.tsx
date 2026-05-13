// src/components/hr/dashboard/DeptStatusDashboard.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AssignInterviewerModal from "./AssignInterviewerModal";
import DeptInterviewModal from "./DeptInterviewModal"; // 💡 새로 만든 상세 모달 임포트
import { DeptStatus } from "@/types/hr";

// 💡 AssignInterviewerModal에서 참조하는 인터페이스 유지
export interface UpcomingInterview {
  id: string;
  date: string; // ISO String
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

  // 💡 1. [면접관 할당] 모달 상태
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState<UpcomingInterview | null>(null);

  // 💡 2. [부서 상세 현황] 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeptName, setSelectedDeptName] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  // 💡 1. 스크롤 가능한 컨테이너를 가리킬 Ref 생성
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 💡 컴포넌트 전용 새로고침 핸들러
  const handleRefresh = async () => {
    if (isLoading) return; // 중복 클릭 방지

    setIsLoading(true);

    // ✅ 스크롤을 부드럽게 맨 위로 올림
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth", // 'smooth'는 스르륵 이동, 'auto'는 즉시 이동
    });
    // 실제 API 재호출 시간을 시뮬레이션 (0.8초)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 무한 스크롤 상태와 데이터를 초기 상태로 리셋
    setPage(1);
    setHasMore(true);
    setItems(initialData); // 실제로는 여기서 fetch 함수를 다시 호출하여 새로운 데이터를 세팅합니다.

    setIsLoading(false);
  };

  // 무한 스크롤 데이터 로드
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
        {/* 💡 정적 뱃지에서 인터랙티브 새로고침 버튼으로 고도화 */}
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

      {/* 스크롤 영역 */}
      <div
        className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1 bg-slate-50/20"
        ref={scrollContainerRef}
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {items.map((item) => (
            // 💡 3. 카드(div) 전체를 클릭 가능하게 만들고, Detail 모달을 띄웁니다.
            <div
              key={item.id}
              onClick={() => {
                setSelectedDeptName(item.deptName);
                setIsDetailModalOpen(true);
              }}
              className="group border border-slate-200 bg-white rounded-[20px] p-5 transition-all duration-300 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer relative"
            >
              {/* 호버 시 우측 상단에 옅게 나타나는 상세보기 화살표 아이콘 (UX 디테일) */}
              <i className="bx bx-right-top-arrow-circle absolute right-4 top-4 text-2xl text-slate-200 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-all duration-300"></i>

              {/* 상단: 부서명 및 현재 상태 */}
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

                {/* 💡 4. 버튼 클릭 시 e.stopPropagation()으로 부모(카드) 클릭 이벤트 무시 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 카드의 onClick(상세보기)이 실행되지 않도록 막음

                    // AssignInterviewerModal 규격에 맞게 데이터 가공
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
                  <i className="bx bx-user-plus text-sm"></i> 면접관 할당
                </button>
              </div>

              {/* 하단: 통계 영역 (경력/신입 구분) */}
              <div className="space-y-2.5 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  가장 최근 일정 기준
                </p>

                {/* 경력 Stat */}
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

                {/* 신입 Stat */}
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

        {/* 로딩 인디케이터 */}
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

      {/* 💡 5. 두 개의 모달 마운트 */}

      {/* (1) 면접관 할당 모달 (버튼 클릭 시) */}
      <AssignInterviewerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        interviewData={assignData}
      />

      {/* (2) 부서 세부 현황 모달 (카드 전체 클릭 시) */}
      <DeptInterviewModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        deptName={selectedDeptName}
      />
    </div>
  );
}
