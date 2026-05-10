// src/components/hr/dashboard/Q4UpcomingInterviews.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AssignInterviewerModal from "./AssignInterviewerModal";
export interface UpcomingInterview {
  id: string;
  date: string; // ISO String
  team: string;
  round: string;
  expType: "신입" | "경력" | "무관";
  intervieweeCount: number;
  applicantCount: number;
}

interface Q4Props {
  initialData: UpcomingInterview[];
}

export default function Q4UpcomingInterviews({ initialData }: Q4Props) {
  const [items, setItems] = useState<UpcomingInterview[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 💡 [준비] 면접관 할당 모달을 위한 상태 추가 (기억 완료!)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] =
    useState<UpcomingInterview | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  // ... (기존 fetchMoreData, useEffect 무한 스크롤 로직 완벽히 동일 유지) ...
  const fetchMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newItems: UpcomingInterview[] = Array.from({ length: 4 }).map(
      (_, i) => {
        const uniqueId = `mock-${page}-${i}`;
        const futureDate = new Date(Date.now() + (page * 2 + i) * 86400000);
        return {
          id: uniqueId,
          date: futureDate.toISOString(),
          team: ["디자인팀", "재무팀", "영업기획팀", "AI리서치팀"][
            Math.floor(Math.random() * 4)
          ],
          round: ["1차 실무 면접", "2차 컬쳐핏 면접", "최종 임원 면접"][
            Math.floor(Math.random() * 3)
          ],
          expType: ["신입", "경력", "무관"][Math.floor(Math.random() * 3)] as
            | "신입"
            | "경력"
            | "무관",
          intervieweeCount: Math.floor(Math.random() * 5) + 1,
          applicantCount: Math.floor(Math.random() * 50) + 10,
        };
      },
    );

    setItems((prev) => {
      const combined = [...prev, ...newItems];
      return combined.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    });
    setPage((prev) => prev + 1);
    setIsLoading(false);
    if (page >= 4) setHasMore(false);
  }, [isLoading, hasMore, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMoreData();
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchMoreData, hasMore, isLoading]);

  return (
    // 💡 1. 컨테이너 디자인: 좀 더 부드러운 곡선(rounded-[24px])과 입체적인 그림자(shadow-sm) 적용
    <div className="bg-white border border-slate-200/80 rounded-[24px] shadow-sm flex flex-col h-[500px]">
      {/* 💡 2. 헤더 영역: 뱃지 디자인과 여백 최적화 */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-t-[24px]">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
            <i className="bx bx-time text-lg"></i>
          </div>
          다가오는 면접 일정
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Total
          </span>
          <span className="text-sm font-black bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full shadow-sm">
            {items.length}건
          </span>
        </div>
      </div>

      {/* 💡 3. 스크롤 영역: 그리드 갭 최적화 및 스크롤바 디자인 */}
      <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {items.map((item) => {
            const d = new Date(item.date);
            const formattedDate = `${d.getMonth() + 1}월 ${d.getDate()}일 (${["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}) ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

            const now = new Date();
            const diffTime = d.getTime() - now.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            const isPast = diffTime < 0;
            const isUrgent = diffDays > 0 && diffDays <= 7;

            return (
              // 💡 4. 카드 디자인: 호버 이펙트와 테두리 두께 조절, 상태별 투명도(opacity) 적용
              <div
                key={item.id}
                className={`group border rounded-[20px] p-5 transition-all duration-300 flex flex-col relative overflow-hidden
                                    ${
                                      isPast
                                        ? "bg-slate-50/80 border-slate-100 opacity-60 grayscale-[0.2]"
                                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1"
                                    }`}
              >
                {/* 긴급(Urgent) 시각적 힌트 라인 */}
                {!isPast && isUrgent && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-400"></div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest
                                                ${isPast ? "bg-slate-200 text-slate-500" : "bg-indigo-50 text-indigo-600"}`}
                      >
                        {item.team}
                      </span>
                      {isPast && (
                        <span className="text-[10px] font-black px-2 py-1 bg-slate-700 text-white rounded-md uppercase">
                          종료
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-black text-base truncate pr-2
                                            ${isPast ? "text-slate-500" : "text-slate-800"}`}
                    >
                      {item.round}
                    </h3>
                    <div
                      className={`text-[13px] font-bold mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1
                        ${isPast ? "text-slate-400" : isUrgent ? "text-rose-500" : "text-slate-500"}`}
                    >
                      {/* 💡 1. 아이콘과 날짜를 하나의 그룹으로 묶어 아이콘만 혼자 위로 떨어지는 것을 방지합니다. */}
                      <span className="flex items-center gap-1.5">
                        <i className="bx bx-calendar-event text-base shrink-0"></i>
                        <span>{formattedDate}</span>
                      </span>

                      {/* 💡 2. 임박 뱃지에 shrink-0과 whitespace-nowrap을 주어 형태가 찌그러지는 것을 완벽히 방어합니다. */}
                      {!isPast && isUrgent && (
                        <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded text-rose-600 shrink-0 whitespace-nowrap">
                          임박
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 💡 5. 액션 버튼 디자인: 그림자 및 활성/비활성 스타일 명확화 */}
                  <button
                    disabled={isPast}
                    onClick={() => {
                      // 다음 요청을 위해 모달을 여는 핸들러를 연결해 두었습니다.
                      setSelectedInterview(item);
                      setIsAssignModalOpen(true);
                    }}
                    className={`shrink-0 text-xs font-black px-3 py-2 rounded-xl transition-all flex items-center gap-1.5
                                            ${
                                              isPast
                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                : "bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm active:scale-95"
                                            }`}
                  >
                    <i
                      className={`bx ${isPast ? "bx-check-double text-lg" : "bx-user-plus text-lg"}`}
                    ></i>
                    {isPast ? "배정완료" : "할당하기"}
                  </button>
                </div>

                {/* 💡 6. 미니 테이블(통계) 디자인: 아이콘 추가 및 색상 톤 조절 */}
                <div
                  className={`mt-auto rounded-xl p-3.5 border ${isPast ? "bg-slate-100/50 border-slate-200/50" : "bg-slate-50 border-slate-100"}`}
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-left flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        채용 유형
                      </span>
                      <span
                        className={`text-xs font-black ${isPast ? "text-slate-500" : "text-slate-700"}`}
                      >
                        {item.expType}
                      </span>
                    </div>
                    <div className="text-center flex flex-col gap-1 border-x border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        대상자
                      </span>
                      <span
                        className={`text-xs font-black flex items-center justify-center gap-1 ${isPast ? "text-slate-500" : "text-indigo-600"}`}
                      >
                        <i className="bx bxs-user-badge"></i>
                        {item.intervieweeCount}명
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        총 지원
                      </span>
                      <span
                        className={`text-xs font-black ${isPast ? "text-slate-500" : "text-slate-600"}`}
                      >
                        {item.applicantCount}명
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 로딩 및 종료 인디케이터 (디자인 고도화) */}
        <div ref={loaderRef} className="py-8 flex justify-center w-full">
          {isLoading && (
            <div className="flex items-center gap-2.5 text-indigo-600 font-black text-sm bg-indigo-50/80 px-5 py-2.5 rounded-full shadow-sm animate-pulse border border-indigo-100">
              <i className="bx bx-loader-alt bx-spin text-xl"></i>
              일정을 추가로 불러오는 중...
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <i className="bx bx-flag text-base"></i> 더 이상 예정된 일정이
              없습니다
            </div>
          )}
        </div>
      </div>
      {/* 💡 새로 추가할 모달 컴포넌트 */}
      <AssignInterviewerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        interviewData={selectedInterview}
      />
    </div>
  );
}
