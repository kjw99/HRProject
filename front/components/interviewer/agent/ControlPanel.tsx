"use client";

import React, { useMemo } from "react";
import { BackendPosition, BackendCandidate } from "@/types/interviewer";

interface ControlPanelProps {
  positions: BackendPosition[];
  candidates: BackendCandidate[];
  selectedPositionId: number | null;
  setSelectedPositionId: (id: number | null) => void;
  selectedCandidateId: number | null;
  setSelectedCandidateId: (id: number | null) => void;
  isGenerating: boolean;
  onGenerateAI: () => void;
}

function CheckBox({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-4 h-4 shrink-0 flex items-center justify-center border rounded transition-all duration-200 ${checked ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "border-slate-300 bg-white hover:border-indigo-400"}`}
    >
      {checked && <i className="bx bx-check text-[14px]"></i>}
    </button>
  );
}

export default function ControlPanel(props: ControlPanelProps) {
  const {
    positions,
    candidates,
    selectedPositionId,
    setSelectedPositionId,
    selectedCandidateId,
    setSelectedCandidateId,
    isGenerating,
    onGenerateAI,
  } = props;

  // 💡 선택된 부서(position_id)에 맞는 지원자만 필터링
  const filteredCandidates = useMemo(() => {
    if (!selectedPositionId) return [];
    return candidates.filter((c) => c.position_id === selectedPositionId);
  }, [candidates, selectedPositionId]);

  const selectedCandidate = candidates.find(
    (c) => c.candidate_id === selectedCandidateId,
  );

  return (
    <div className="w-full xl:w-95 shrink-0 flex flex-col gap-5">
      {/* 부서 + 지원자 리스트 */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[320px]">
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <div className="flex-1 px-5 py-3 text-xs font-black text-slate-700 border-r border-slate-200 uppercase tracking-widest">
            대상 부서
          </div>
          <div className="flex-1 px-5 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">
            지원자
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 좌측: 부서 목록 */}
          <div className="flex-1 border-r border-slate-100 overflow-y-auto custom-scrollbar hide-scrollbar overflow-x-hidden h-full ">
            {/* 
     1. scrollbar-thin 대신 custom-scrollbar 적용
     2. h-full 또는 h-[320px] 등 부모 높이에 맞게 고정 
  */}
            {positions.map((pos) => (
              <div
                key={pos.positionId}
                title={pos.positionName}
                className={`flex items-center gap-2.5 px-3 py-3 cursor-pointer transition-colors border-l-2 min-h-[48px] ${
                  selectedPositionId === pos.positionId
                    ? "bg-indigo-50/50 border-indigo-500"
                    : "border-transparent hover:bg-slate-50"
                }`}
                onClick={() =>
                  setSelectedPositionId(
                    selectedPositionId === pos.positionId
                      ? null
                      : pos.positionId,
                  )
                }
              >
                <CheckBox
                  checked={selectedPositionId === pos.positionId}
                  onClick={() => {}}
                />

                <div className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[12px] font-bold tracking-tight ${
                      selectedPositionId === pos.positionId
                        ? "text-indigo-700"
                        : "text-slate-600"
                    }`}
                  >
                    {pos.positionName}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 우측: 지원자 목록 (candidate_id 매핑) */}
          <div className="flex-1 overflow-y-auto hide-scrollbar scrollbar-thin bg-slate-50/30">
            {filteredCandidates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <p className="text-[11px] font-bold text-slate-400">
                  {selectedPositionId
                    ? " (해당 부서에 지원자가 없습니다)"
                    : "부서를 선택해주세요."}
                </p>
              </div>
            ) : (
              filteredCandidates.map((cnd) => {
                // 현재 선택된 상태인지 변수로 추출 (가독성 향상)
                const isSelected = selectedCandidateId === cnd.candidate_id;

                return (
                  <div
                    key={cnd.candidate_id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50/50 shadow-sm"
                        : "hover:bg-slate-50"
                    }`}
                    // 부모 div 클릭 시에만 로직을 수행하도록 통일
                    onClick={() =>
                      setSelectedCandidateId(
                        isSelected ? null : cnd.candidate_id,
                      )
                    }
                  >
                    {/* 💡 CheckBox 내부의 onClick은 제거하거나 e.stopPropagation() 처리된 상태여야 함 */}
                    <CheckBox
                      checked={isSelected}
                      onClick={() => {}} // 부모 div에서 처리하므로 비워둡니다.
                    />

                    <div className="flex flex-col">
                      <span
                        className={`text-[13px] font-bold ${
                          isSelected ? "text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {cnd.name || "이름 없음"}
                      </span>

                      {/* experience_level이 없을 경우를 대비한 방어 코드 추가 */}
                      <span className="text-[10px] font-semibold text-slate-400">
                        {cnd.experience_level
                          ? cnd.experience_level
                          : "경력 정보 없음"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 옵션 및 버튼 패널 */}
      <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <i className="bx bx-slider-alt text-lg"></i> 생성 조건 설정
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
            채용 공고 선택
          </label>
          <div className="relative">
            <select
              value={selectedPositionId ?? ""}
              onChange={(e) =>
                setSelectedPositionId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className="w-full pl-4 pr-10 py-2.5 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="" disabled>
                공고를 선택하세요
              </option>
              {positions.map((pos) => (
                <option key={pos.positionId} value={pos.positionId}>
                  {pos.positionName}
                </option>
              ))}
            </select>
            <i className="bx bx-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerateAI}
          disabled={isGenerating || !selectedPositionId || !selectedCandidateId}
          className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-black transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <i className="bx bx-loader-alt bx-spin text-lg" /> 생성 중...
            </>
          ) : (
            <>
              <i className="bx bx-magic-wand text-lg" /> 질문 생성하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
