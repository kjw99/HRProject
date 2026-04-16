import React from "react";
import { GeneratedQuestion } from "@/types/hr";

interface ResultsPanelProps {
  isGenerating: boolean;
  generatedQuestions: GeneratedQuestion[];
}

export default function ResultsPanel({
  isGenerating,
  generatedQuestions,
}: ResultsPanelProps) {
  return (
    <div className="lg:col-span-8">
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full min-h-150 flex flex-col overflow-hidden group">
        {/* 패널 헤더 */}
        <div className="px-8 lg:px-10 py-7 border-b border-slate-100 flex justify-between bg-white items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <i className="bx bx-brain text-indigo-600 text-2xl"></i>
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight leading-none">
                ✨ AI 심층 면접 리포트
              </h3>
              <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">
                Gemini 2.5 Flash Inference
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-[11px] font-black shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Real-time Connected
          </div>
        </div>

        {/* 패널 콘텐츠 영역 */}
        <div className="p-6 lg:p-12 flex-1 bg-slate-50/30 overflow-y-auto">
          {/* 상태 1: 빈 화면 (대기) */}
          {!isGenerating && generatedQuestions.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 space-y-8">
              <div className="w-32 h-32 rounded-[48px] bg-white border border-slate-100 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-700">
                <i className="bx bx-ghost text-7xl text-slate-100 group-hover:text-indigo-50 transition-colors"></i>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">
                  데이터가 비어 있습니다
                </p>
                <p className="text-sm text-slate-400 mt-2 font-bold px-10">
                  좌측 패널에서 공고와 지원자를 선택하고 생성 버튼을 눌러주세요.
                </p>
              </div>
            </div>
          )}

          {/* 상태 2: 로딩 중 */}
          {isGenerating && (
            <div className="h-full flex flex-col items-center justify-center py-24 space-y-12">
              <div className="relative">
                <div className="w-28 h-28 border-12 border-indigo-50 rounded-full"></div>
                <div className="w-28 h-28 border-12 border-indigo-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(99,102,241,0.4)]"></div>
                <i className="bx bxs-zap text-5xl text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></i>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 tracking-tight animate-pulse">
                  Gemini가 심층 역량을 추론 중입니다...
                </p>
                <p className="text-sm text-slate-400 mt-3 font-bold max-w-sm italic">
                  지원자의 이력과 사내 RAG 지식 베이스를 교차 대조하고 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* 상태 3: 결과 출력 */}
          {!isGenerating && generatedQuestions.length > 0 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              {generatedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 lg:p-11 rounded-[40px] border border-indigo-100/60 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.08)] hover:border-indigo-300 hover:shadow-xl transition-all duration-300 group/card relative"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-widest border border-indigo-100">
                      {q.type}
                    </span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>

                  <h4 className="text-slate-900 font-bold text-xl lg:text-[22px] leading-relaxed mb-8">
                    <span className="text-indigo-500/20 italic font-black mr-4 text-4xl">
                      Q{idx + 1}.
                    </span>
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50/80 p-7 rounded-[28px] border border-slate-100 transition-colors">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="bx bx-target-lock text-lg"></i> 설계 의도
                      </span>
                      <p className="text-slate-700 text-[14px] leading-relaxed font-bold">
                        {q.intent}
                      </p>
                    </div>
                    <div className="bg-indigo-50/30 border border-indigo-100/50 p-7 rounded-[28px] transition-colors group-hover/card:bg-indigo-50/50">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="bx bx-data text-lg"></i> RAG 분석 근거
                      </span>
                      <p className="text-[14px] leading-relaxed font-black italic underline underline-offset-8 decoration-2 text-indigo-900/70 decoration-indigo-200">
                        {q.ragContext}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full py-8 border-3 border-dashed border-slate-200 rounded-[40px] text-slate-400 font-black text-[15px] hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-4 active:scale-95">
                <i className="bx bx-plus-circle text-3xl"></i>
                <span>에이전트에게 추가 질문 요청하기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
