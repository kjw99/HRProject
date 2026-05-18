"use client";

import React, { useState } from "react";
import { UIGeneratedQuestion } from "@/types/interviewer";

interface ResultsPanelProps {
  isGenerating: boolean;
  questions: UIGeneratedQuestion[];
  onSave: () => void;
  isSaving: boolean;
  onAdditionalChat: (msg: string) => void;
}

const TYPE_MAP: Record<
  string,
  { label: string; className: string; icon: string }
> = {
  "기술 역량": {
    label: "Tech Skill",
    className: "bg-blue-50 text-blue-600 border-blue-200",
    icon: "bx-code-alt",
  },
  컬쳐핏: {
    label: "Culture Fit",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: "bx-bulb",
  },
};

export default function ResultsPanel({
  isGenerating,
  questions,
  onSave,
  isSaving,
  onAdditionalChat,
}: ResultsPanelProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<number, string>>({});
  const [chatInput, setChatInput] = useState("");

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    onAdditionalChat(chatInput);
    setChatInput("");
  };

  const isEmpty = questions.length === 0 && !isGenerating;

  return (
    <div className="flex-1 bg-white rounded-[20px] border border-slate-200 shadow-sm flex flex-col min-h-[700px] overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
        <h3 className="text-sm font-black text-slate-800">
          생성된 질문 리스트
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
          Total: {questions.length}
        </span>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 bg-slate-50/30">
        {/* 💡 1. 빈 상태 (디자인 디테일 및 애니메이션 복구) */}
        {isEmpty && (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 flex items-center justify-center mb-5 shadow-sm">
              <i className="bx bx-ghost text-5xl text-slate-300" />
            </div>
            <p className="text-[15px] font-black text-slate-700">
              질문이 아직 없습니다
            </p>
            <p className="text-[13px] font-medium text-slate-500 mt-1.5 text-center">
              좌측 패널에서 조건을 선택하고 생성 버튼을 눌러주세요.
            </p>
          </div>
        )}

        {/* 💡 2. 로딩 상태 (커스텀 스피너 및 텍스트 계층 복구) */}
        {isGenerating && (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* 커스텀 AI 브레인 스피너 */}
            <div className="relative w-16 h-16 mb-5">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <i className="bx bx-brain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 text-xl" />
            </div>
            <p className="text-[15px] font-black text-slate-800 animate-pulse">
              AI가 심층 질문을 분석 중입니다...
            </p>
            <p className="text-[13px] font-medium text-slate-500 mt-1.5 text-center">
              이력서와 직무 기술서를 교차 검증하고 있습니다.
            </p>
          </div>
        )}

        {/* 질문 카드 */}
        {!isGenerating &&
          questions.map((q, idx) => {
            const typeInfo = TYPE_MAP[q.questionType] ?? {
              label: q.questionType,
              className: "bg-slate-100 text-slate-600 border-slate-200",
              icon: "bx-message",
            };
            const isEditing = editingIdx === idx;
            const displayText = editedTexts[idx] ?? q.questionText;

            return (
              <div
                key={q.id}
                className="bg-white rounded-[16px] border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider flex items-center gap-1.5 border ${typeInfo.className}`}
                  >
                    <i className={`bx ${typeInfo.icon} text-sm`}></i>{" "}
                    {typeInfo.label}
                  </span>
                  <button
                    onClick={() => setEditingIdx(isEditing ? null : idx)}
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    <i
                      className={`bx ${isEditing ? "bx-check" : "bx-edit"} text-lg`}
                    />
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={displayText}
                    onChange={(e) =>
                      setEditedTexts((prev) => ({
                        ...prev,
                        [idx]: e.target.value,
                      }))
                    }
                    className="w-full text-[13px] font-bold text-slate-800 bg-indigo-50/30 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 border border-slate-200 mb-4"
                    rows={3}
                  />
                ) : (
                  <p className="text-[14px] font-bold text-slate-800 leading-relaxed mb-5">
                    Q. {displayText}
                  </p>
                )}

                {/* 💡 평가 의도 및 생성 근거 (generationBasis) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <i className="bx bx-target-lock text-indigo-400"></i> 평가
                      의도
                    </p>
                    <p className="text-[11px] font-medium text-slate-600">
                      {q.evaluationIntent}
                    </p>
                  </div>

                  <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <i className="bx bx-file-find text-emerald-400"></i> 생성
                      근거
                    </p>
                    <p className="text-[11px] font-medium text-slate-600">
                      {q.generationBasis}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 하단 툴바 */}
      {(questions.length > 0 || isGenerating) && (
        <div className="p-5 border-t border-slate-100 bg-white flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="질문 난이도를 높여줘, 꼬리 질문 추가해줘 등..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleChatSubmit}
              className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-[13px] font-bold shrink-0"
            >
              전송
            </button>
          </div>

          <button
            onClick={onSave}
            disabled={isSaving || questions.length === 0}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-black disabled:opacity-50 flex justify-center gap-2"
          >
            {isSaving ? (
              <>
                <i className="bx bx-loader-alt bx-spin text-lg" /> 저장 중...
              </>
            ) : (
              <>
                <i className="bx bx-save text-lg" /> 확정 및 저장하기
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
