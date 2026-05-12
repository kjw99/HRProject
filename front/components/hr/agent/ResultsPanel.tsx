"use client";

import { useState } from "react";
import { BackendGeneratedQuestion } from "@/apis/questionApi";

interface ResultsPanelProps {
  isGenerating: boolean;
  questions: BackendGeneratedQuestion[];
  onSave: () => void;
  isSaving: boolean;
}

const TYPE_MAP: Record<string, { label: string; className: string }> = {
  job_based: { label: "기술 역량", className: "bg-blue-100 text-blue-700" },
  candidate_based: { label: "조직 적합성", className: "bg-teal-100 text-teal-700" },
  candidate_job_fit_based: { label: "문제 해결", className: "bg-orange-100 text-orange-700" },
};

function getTypeInfo(questionType: string) {
  return TYPE_MAP[questionType] ?? { label: questionType, className: "bg-gray-100 text-gray-600" };
}

export default function ResultsPanel({
  isGenerating,
  questions,
  onSave,
  isSaving,
}: ResultsPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<number, string>>({});

  const isEmpty = !isGenerating && questions.length === 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="flex-1 flex flex-col min-h-[640px] min-w-0">
      {/* 질문 카드 영역 */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">

        {/* 빈 상태 */}
        {isEmpty && (
          <div className="h-full flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <i className="bx bx-ghost text-5xl text-gray-200" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-gray-500">질문이 아직 없습니다</p>
              <p className="text-[13px] text-gray-400 mt-1">
                좌측에서 부서와 지원자를 선택한 뒤 생성 버튼을 눌러주세요.
              </p>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-gray-700 animate-pulse">
                AI가 질문을 생성하고 있습니다...
              </p>
              <p className="text-[13px] text-gray-400 mt-1">
                이력서와 직무 기술서를 분석 중입니다.
              </p>
            </div>
          </div>
        )}

        {/* 질문 카드 목록 */}
        {!isGenerating &&
          questions.map((q, idx) => {
            const typeInfo = getTypeInfo(q.questionType);
            const isEditing = editingIdx === idx;
            const displayText = editedTexts[idx] ?? q.questionText;

            return (
              <div key={idx}>
                {/* Figma 스타일 Article 레이블 */}
                <p className="text-[11px] text-gray-400 mb-1.5 px-1">
                  Article - Question Card {idx + 1}
                </p>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  {/* 카드 헤더: 태그 + 아이콘 */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold ${typeInfo.className}`}
                    >
                      {typeInfo.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingIdx(isEditing ? null : idx)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="수정"
                      >
                        <i className="bx bx-edit text-[15px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(displayText)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="복사"
                      >
                        <i className="bx bx-copy text-[15px]" />
                      </button>
                    </div>
                  </div>

                  {/* 질문 텍스트 */}
                  {isEditing ? (
                    <textarea
                      value={displayText}
                      onChange={(e) =>
                        setEditedTexts((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                      rows={3}
                      className="w-full text-[13px] font-medium text-gray-900 leading-relaxed mb-4 border border-blue-300 rounded-lg px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    <p className="text-[13px] font-medium text-gray-900 leading-relaxed mb-4">
                      &ldquo;{displayText}&rdquo;
                    </p>
                  )}

                  {/* 의도 섹션 */}
                  <div className="border-l-4 border-blue-400 bg-blue-50/60 pl-3.5 py-2.5 rounded-r-xl">
                    <p className="text-[11px] font-semibold text-blue-600 mb-1 flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-blue-500 text-[8px] font-black leading-none">
                        i
                      </span>
                      의도
                    </p>
                    <p className="text-[12px] text-gray-600 leading-relaxed">
                      {q.evaluationIntent}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 하단: Chat 입력 + 저장 버튼 */}
      {(questions.length > 0 || isGenerating) && (
        <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 flex-shrink-0">Chat</span>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="추가 요청사항을 입력하세요..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
            <button
              type="button"
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[13px] font-medium transition-colors flex-shrink-0"
            >
              전송
            </button>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || questions.length === 0}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <i className="bx bx-loader-alt bx-spin text-base" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
