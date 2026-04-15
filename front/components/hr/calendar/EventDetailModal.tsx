"use client";

import React from "react";
import { CalendarEvent } from "@/types/hr";

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: Props) {
  return (
    // 1️⃣ 외부 배경 레이어 (Overlay)
    <div
      onClick={onClose} // 💡 배경 클릭 시 onClose 실행
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      {/* 2️⃣ 모달 내부 콘텐츠 박스 */}
      <div
        onClick={(e) => e.stopPropagation()} // 💡 중요: 내부 클릭 시에는 부모(배경)로 이벤트가 전달되지 않게 막음
        className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-[20px] font-black text-slate-900">
              {event.title} 상세
            </h3>
            <p className="text-[13px] text-slate-400 font-bold flex items-center gap-1 mt-1">
              <i className="bx bx-time-five"></i> {event.startTime} -{" "}
              {event.endTime} | {event.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 transition-all"
          >
            <i className="bx bx-x text-2xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <h4 className="text-[14px] font-black text-slate-400 uppercase tracking-widest">
            참석 대상자 ({event.candidates.length}명)
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {event.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                    {candidate.name[0]}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-800">
                      {candidate.name}
                    </p>
                    <p className="text-[12px] text-slate-400 font-medium">
                      {candidate.position}
                    </p>
                  </div>
                </div>
                <button className="text-indigo-500 hover:text-indigo-700 text-sm font-black">
                  이력서 보기
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 flex gap-3">
            <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[14px] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
            onClick={() => alert("준비중입니다.")}>
              <i className="bx bx-video"></i> 면접실 입장
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[14px] hover:bg-slate-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
