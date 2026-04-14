"use client";

import React, { useState } from "react";

export interface Log {
  id: string;
  type: string;
  message: string;
  time: string;
  user: string;
}

export default function SystemLogs({ logs }: { logs: Log[] }) {
  // 💡 처음에는 5개만 보여주도록 상태 설정
  const [visibleCount, setVisibleCount] = useState(5);
  // 추가 로딩 애니메이션 상태
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 현재 화면에 보여질 로그만 잘라내기
  const displayedLogs = logs.slice(0, visibleCount);

  // 🚀 스크롤 감지 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

    // 스크롤이 맨 밑(바닥에서 30px 이내)에 도달했고, 아직 로드할 데이터가 남아있을 때
    if (scrollHeight - scrollTop <= clientHeight + 30) {
      if (visibleCount < logs.length && !isLoadingMore) {
        setIsLoadingMore(true);

        // 실제 API 통신처럼 자연스러운 UX를 위해 0.5초 딜레이 후 5개 추가
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 5, logs.length));
          setIsLoadingMore(false);
        }, 500);
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-[450px]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2">
          <i className="bx bx-list-ul text-slate-400"></i> 시스템 이벤트 로그
        </h2>
        <span className="text-[12px] font-bold text-slate-400">
          {displayedLogs.length} / {logs.length}
        </span>
      </div>

      <style>{`
        .logs-scrollbar::-webkit-scrollbar { width: 4px; }
        .logs-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .logs-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* 💡 onScroll 이벤트 부착 및 스크롤 영역 지정 */}
      <div
        className="flex-1 overflow-y-auto space-y-4 logs-scrollbar pr-2 pb-4"
        onScroll={handleScroll}
      >
        {displayedLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-[16px] bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm border ${
                  log.type === "error"
                    ? "bg-rose-50 text-rose-500 border-rose-100"
                    : log.type === "warning"
                      ? "bg-amber-50 text-amber-500 border-amber-100"
                      : log.type === "hallucination"
                        ? "bg-purple-50 text-purple-500 border-purple-100"
                        : "bg-blue-50 text-blue-500 border-blue-100"
                }`}
              >
                <i
                  className={`bx ${
                    log.type === "error"
                      ? "bx-x-circle"
                      : log.type === "warning"
                        ? "bx-error"
                        : log.type === "hallucination"
                          ? "bx-ghost"
                          : "bx-info-circle"
                  } text-lg`}
                ></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[6px] ${
                      log.type === "error"
                        ? "bg-rose-100 text-rose-700"
                        : log.type === "warning"
                          ? "bg-amber-100 text-amber-700"
                          : log.type === "hallucination"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {log.time}
                  </span>
                </div>
                <p className="text-[13px] font-bold text-slate-700 leading-snug truncate group-hover:whitespace-normal transition-all">
                  {log.message}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
                  <i className="bx bxs-user-circle"></i> {log.user}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* 바닥에 닿았을 때 보여줄 로딩 스피너 */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <i className="bx bx-loader-alt animate-spin text-2xl text-indigo-500"></i>
          </div>
        )}

        {/* 모든 로그를 다 불러왔을 때 */}
        {visibleCount >= logs.length && logs.length > 0 && (
          <div className="text-center py-4 text-[12px] font-bold text-slate-400">
            모든 로그를 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
}
