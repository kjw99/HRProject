// src/components/hr/dashboard/Q4UpcomingInterviews.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// 💡 1. 타입 정의 (기존과 동일)
export interface UpcomingInterview {
    id: string;
    date: string; // ISO String
    team: string;
    round: string;
    expType: '신입' | '경력' | '무관';
    intervieweeCount: number;
    applicantCount: number;
}

interface Q4Props {
    initialData: UpcomingInterview[]; // SSR로 처음 받아온 데이터
}

export default function Q4UpcomingInterviews({ initialData }: Q4Props) {
    // 💡 2. 상태 관리
    const [items, setItems] = useState<UpcomingInterview[]>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // 무한 스크롤 감지를 위한 꼬리표(ref)
    const loaderRef = useRef<HTMLDivElement>(null);

    // 💡 3. 추가 데이터를 불러오는 가짜 API 호출 함수 (실제 API 연동 시 이 부분을 교체)
    const fetchMoreData = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        // API 통신 딜레이 시뮬레이션 (1초 대기)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 가짜 데이터 생성 로직 (1번 호출 시 4개씩 추가)
        const newItems: UpcomingInterview[] = Array.from({ length: 4 }).map((_, i) => {
            const uniqueId = `mock-${page}-${i}`;
            // 기존 날짜들에 이어서 계속 미래의 날짜가 나오도록 세팅
            const futureDate = new Date(Date.now() + (page * 2 + i) * 86400000);
            return {
                id: uniqueId,
                date: futureDate.toISOString(),
                team: ['디자인팀', '재무팀', '영업기획팀', 'AI리서치팀'][Math.floor(Math.random() * 4)],
                round: ['1차 실무 면접', '2차 컬쳐핏 면접', '최종 임원 면접'][Math.floor(Math.random() * 3)],
                expType: ['신입', '경력', '무관'][Math.floor(Math.random() * 3)] as '신입' | '경력' | '무관',
                intervieweeCount: Math.floor(Math.random() * 5) + 1,
                applicantCount: Math.floor(Math.random() * 50) + 10,
            };
        });

        setItems((prev) => {
            // 기존 데이터와 새 데이터를 합친 후 날짜순 정렬
            const combined = [...prev, ...newItems];
            return combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });
        setPage((prev) => prev + 1);
        setIsLoading(false);

        // 테스트용: 5페이지(약 20개)까지만 로드하고 멈춤
        if (page >= 4) setHasMore(false);
    }, [isLoading, hasMore, page]);

    // 💡 4. IntersectionObserver: 스크롤이 바닥(loaderRef)에 닿으면 fetchMoreData 실행
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchMoreData();
                }
            },
            { threshold: 0.1 } // 10%만 보여도 트리거
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [fetchMoreData, hasMore, isLoading]);

    return (
        // 💡 5. 컴포넌트 자체를 400px 고정/최소 높이로 잡고, 내부에 스크롤을 뚫어줍니다.
        <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm flex flex-col h-[500px]">

            {/* 고정된 헤더 영역 */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <i className="bx bx-time text-rose-500"></i> 다가오는 면접 일정
                </h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                    총 {items.length}건
                </span>
            </div>

            {/* 💡 내부 스크롤이 발생하는 데이터 영역 */}
            <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                        const d = new Date(item.date);
                        const formattedDate = `${d.getMonth() + 1}월 ${d.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}) ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

                        const now = new Date();
                        const diffTime = d.getTime() - now.getTime();
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);

                        // 💡 상태 판별 로직
                        const isPast = diffTime < 0;             // 이미 지남
                        const isUrgent = diffDays > 0 && diffDays <= 7; // 일주일 내 (임박)
                        const isFuture = diffDays > 7;           // 여유 있음

                        return (
                            <div
                                key={item.id}
                                className={`border rounded-2xl p-4 transition-all flex flex-col shadow-sm
        ${isPast
                                        ? 'bg-slate-50/50 border-slate-100 opacity-80' // 지난 일정: 배경을 흐리게
                                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide mb-1.5 inline-block
            ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-600'}`}>
                                            {item.team}
                                        </span>

                                        <h3 className={`font-bold text-sm ${isPast ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {item.round}
                                        </h3>

                                        {/* 💡 날짜 색상 조건부 렌더링 */}
                                        <p className={`text-xs font-bold mt-1 flex items-center gap-1
            ${isPast ? 'text-slate-400' : isUrgent ? 'text-rose-500' : 'text-slate-700'}`}>
                                            <i className="bx bx-calendar-event"></i>
                                            {formattedDate}

                                            {/* 상태 뱃지 */}
                                            {isPast && (
                                                <span className="ml-1.5 px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded text-[10px] uppercase font-black">
                                                    종료
                                                </span>
                                            )}

                                        </p>
                                    </div>

                                    {/* 지난 일정일 경우 버튼 비활성화 또는 디자인 변경 */}
                                    <button
                                        disabled={isPast}
                                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1
                                        ${isPast
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                            }`}
                                    >
                                        <i className="bx bx-user-plus"></i>
                                        {isPast ? '배정 완료' : '면접관 할당'}
                                    </button>
                                </div>

                                {/* 미니 테이블 영역 (지난 일정은 더 흐리게) */}
                                <div className={`mt-auto rounded-xl p-3 ${isPast ? 'bg-slate-100/50' : 'bg-slate-50'}`}>
                                    <div className="flex justify-between text-[11px] font-bold text-slate-400 border-b border-slate-200 pb-1.5 mb-1.5">
                                        <span className="w-1/3 text-left">유형</span>
                                        <span className="w-1/3 text-center">면접자</span>
                                        <span className="w-1/3 text-right">전체 지원자</span>
                                    </div>
                                    <div className={`flex justify-between text-xs font-black ${isPast ? 'text-slate-400' : 'text-slate-700'}`}>
                                        <span className={`w-1/3 text-left ${isPast ? 'text-slate-400' : 'text-indigo-600'}`}>{item.expType}</span>
                                        <span className="w-1/3 text-center">{item.intervieweeCount}명</span>
                                        <span className="w-1/3 text-right">{item.applicantCount}명</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 💡 6. 스크롤 감지 및 로딩 스피너 영역 */}
                <div ref={loaderRef} className="py-6 flex justify-center w-full">
                    {isLoading && (
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-full shadow-sm">
                            <i className="bx bx-loader-alt bx-spin text-lg"></i>
                            데이터를 불러오는 중...
                        </div>
                    )}
                    {!hasMore && (
                        <div className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                            <i className="bx bx-check-circle"></i> 모든 일정을 불러왔습니다.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}