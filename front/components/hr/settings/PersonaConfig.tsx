"use client";

import React from "react";

interface PersonaConfigProps {
  tone: string;
  setTone: (val: string) => void;
  techWeight: number;
  setTechWeight: (val: number) => void;
}

export default function PersonaConfig({
  tone,
  setTone,
  techWeight,
  setTechWeight,
}: PersonaConfigProps) {
  const tones = [
    {
      id: "friendly",
      label: "친화적인 (Ice Breaking)",
      icon: "bx-smile",
      desc: "부드러운 분위기 유도",
    },
    {
      id: "analytical",
      label: "분석적인 (Logical)",
      icon: "bx-search-alt",
      desc: "객관적인 역량 검증",
    },
    {
      id: "strict",
      label: "엄격한 (Stress Test)",
      icon: "bx-target-lock",
      desc: "위기 대처 능력 평가",
    },
  ];

  return (
    <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[32px] border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-[20px] font-black text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
            <i className="bx bx-mask text-[22px]"></i>
          </div>
          에이전트 페르소나 및 가드레일
        </h3>
        <p className="text-[13px] text-slate-500 font-medium mt-2">
          질문을 생성하는 AI 면접관의 성향과 핵심 평가 가중치를 디테일하게
          조율합니다.
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. 톤앤매너 설정 */}
        <div>
          <label className="block text-[12px] font-black text-slate-700 mb-3 uppercase tracking-widest flex items-center gap-2">
            <i className="bx bx-message-rounded-dots text-purple-400"></i>{" "}
            톤앤매너
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`flex flex-col items-center justify-center text-center gap-2 p-4 rounded-[20px] border-2 transition-all duration-300 ${
                  tone === t.id
                    ? "border-purple-500 bg-purple-50/50 shadow-sm"
                    : "border-slate-100 hover:border-purple-200 bg-white"
                }`}
              >
                <i
                  className={`bx ${t.icon} text-[28px] ${tone === t.id ? "text-purple-600" : "text-slate-400"}`}
                ></i>
                <div>
                  <h4
                    className={`font-bold text-[13px] ${tone === t.id ? "text-purple-900" : "text-slate-700"}`}
                  >
                    {t.label}
                  </h4>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. 평가 가중치 슬라이더 */}
        <div>
          <label className="block text-[12px] font-black text-slate-700 mb-4 uppercase tracking-widest flex items-center gap-2">
            <i className="bx bx-slider text-purple-400"></i> 평가 가중치 (Tech
            vs Culture Fit)
          </label>

          <div className="bg-slate-50 p-5 rounded-[20px] border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[13px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                직무 역량 (Tech) {techWeight}%
              </span>
              <span className="text-[13px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                조직 적합성 (Culture) {100 - techWeight}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={techWeight}
              onChange={(e) => setTechWeight(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 shadow-inner"
            />
          </div>
        </div>

        {/* 3. 시스템 프롬프트 */}
        <div>
          <label className="block text-[12px] font-black text-slate-700 mb-3 uppercase tracking-widest flex items-center gap-2">
            <i className="bx bx-code-block text-purple-400"></i> 커스텀 시스템
            프롬프트
          </label>
          <textarea
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[20px] text-[13px] font-medium text-slate-700 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none resize-none h-[100px] shadow-inner"
            defaultValue="우리 회사는 '주도성'과 '데이터 기반 의사결정'을 가장 중요하게 생각합니다. 답변의 진위를 파악할 수 있도록 수치화된 결과를 요구하는 꼬리 질문을 최우선으로 생성하세요."
          ></textarea>
        </div>
      </div>
    </div>
  );
}
