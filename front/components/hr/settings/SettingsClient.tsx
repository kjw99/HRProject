"use client";

import React, { useState } from "react";
import KnowledgeBase from "./KnowledgeBase";
import PersonaConfig from "./PersonaConfig";
import Playground from "./Playground";

export default function SettingsClient() {
  // 에이전트 전역 설정 상태
  const [tone, setTone] = useState("analytical");
  const [techWeight, setTechWeight] = useState(70); // 기술 역량 vs 컬쳐핏 가중치 (0~100)

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-[0.98] duration-700 h-full flex flex-col">
      {/* 헤더 영역 */}
      <header className="border-b border-slate-200/60 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-[10px] text-[11px] font-black uppercase tracking-[0.2em] border border-purple-100/50 shadow-sm">
            <i className="bx bx-slider-alt text-sm"></i> Agent Configuration
          </div>
          <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight">
            에이전트 환경 설정
          </h2>
          <p className="text-slate-500 font-semibold text-[14px] md:text-[15px] max-w-2xl leading-relaxed">
            AI 면접관의 지식 범위(RAG)를 확장하고, 질문 성향(Persona)을 튜닝하여
            우리 기업에 딱 맞는 채용 에이전트를 구축하세요.
          </p>
        </div>
        <button className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-[16px] shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-[14px]">
          <i className="bx bx-save text-lg"></i> 전체 설정 배포
        </button>
      </header>

      {/* 반응형 3단 레이아웃 (좌측: 설정 2열 / 우측: 플레이그라운드 1열) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1 min-h-0 pb-8">
        {/* 좌측 패널 (지식 베이스 & 페르소나 설정) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          <KnowledgeBase />
          {/* 에러 해결 포인트: setTone과 setTechWeight 함수를 정확히 전달 */}
          <PersonaConfig
            tone={tone}
            setTone={setTone}
            techWeight={techWeight}
            setTechWeight={setTechWeight}
          />
        </div>

        {/* 우측 패널 (사전 테스트 플레이그라운드) */}
        <div className="lg:col-span-5 xl:col-span-4 h-[800px] lg:h-auto">
          <Playground tone={tone} techWeight={techWeight} />
        </div>
      </div>
    </div>
  );
}
