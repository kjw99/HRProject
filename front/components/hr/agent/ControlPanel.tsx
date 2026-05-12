import { BackendPosition, BackendCandidate } from "@/apis/questionApi";

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

function CheckBox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-4 h-4 flex-shrink-0 flex items-center justify-center border rounded text-[10px] font-bold transition-colors ${
        checked
          ? "bg-gray-800 border-gray-800 text-white"
          : "border-gray-300 bg-white"
      }`}
    >
      {checked && "v"}
    </button>
  );
}

export default function ControlPanel({
  positions,
  candidates,
  selectedPositionId,
  setSelectedPositionId,
  selectedCandidateId,
  setSelectedCandidateId,
  isGenerating,
  onGenerateAI,
}: ControlPanelProps) {
  const filteredCandidates = candidates.filter(
    (c) => !selectedPositionId || c.position_id === selectedPositionId
  );
  const selectedCandidate = candidates.find(
    (c) => c.candidate_id === selectedCandidateId
  );

  return (
    <div className="w-[340px] flex-shrink-0 flex flex-col gap-4">
      {/* Frame 1: 부서 + 지원자 선택 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* 두 열 헤더 */}
        <div className="flex border-b border-gray-200">
          <div className="flex-1 px-5 py-3 text-[13px] font-semibold text-gray-800 border-r border-gray-200 bg-white">
            현재 진행중인 부서
          </div>
          <div className="flex-1 flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-[13px] font-medium text-gray-400">지원자</span>
            <div className="w-14 h-5 rounded bg-gray-100" />
          </div>
        </div>

        {/* 두 열 콘텐츠 */}
        <div className="flex min-h-[160px]">
          {/* 좌: 직무/부서 목록 */}
          <div className="flex-1 border-r border-gray-100 py-1">
            {positions.map((pos) => (
              <div
                key={pos.positionId}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setSelectedPositionId(
                    selectedPositionId === pos.positionId ? null : pos.positionId
                  )
                }
              >
                <CheckBox
                  checked={selectedPositionId === pos.positionId}
                  onClick={() =>
                    setSelectedPositionId(
                      selectedPositionId === pos.positionId ? null : pos.positionId
                    )
                  }
                />
                <span className="text-[13px] text-gray-700">{pos.positionName}</span>
              </div>
            ))}
          </div>

          {/* 우: 지원자 목록 */}
          <div className="flex-1 py-1">
            {filteredCandidates.length === 0 ? (
              <p className="text-[12px] text-gray-300 px-4 py-3">부서를 선택하세요</p>
            ) : (
              filteredCandidates.map((cnd) => (
                <div
                  key={cnd.candidate_id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setSelectedCandidateId(
                      selectedCandidateId === cnd.candidate_id ? null : cnd.candidate_id
                    )
                  }
                >
                  <CheckBox
                    checked={selectedCandidateId === cnd.candidate_id}
                    onClick={() =>
                      setSelectedCandidateId(
                        selectedCandidateId === cnd.candidate_id ? null : cnd.candidate_id
                      )
                    }
                  />
                  <span className="text-[13px] text-gray-700">{cnd.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 생성 조건 설정 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-5">
        <h3 className="text-[14px] font-bold text-gray-900">생성 조건 설정</h3>

        {/* 채용 공고 선택 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-gray-500">채용 공고 선택</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <i className="bx bx-briefcase text-blue-500 text-base" />
            </div>
            <div className="flex-1 min-w-0">
              <select
                value={selectedPositionId ?? ""}
                onChange={(e) =>
                  setSelectedPositionId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full text-[13px] font-semibold text-gray-800 bg-transparent outline-none cursor-pointer appearance-none"
              >
                <option value="">공고를 선택하세요</option>
                {positions.map((pos) => (
                  <option key={pos.positionId} value={pos.positionId}>
                    {pos.positionName}
                  </option>
                ))}
              </select>
            </div>
            <i className="bx bx-chevron-down text-gray-400 text-xl flex-shrink-0 pointer-events-none" />
          </div>
        </div>

        {/* 면접지 선택 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-gray-500">면접지 선택</label>
          <div
            className={`flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl transition-opacity ${
              !selectedPositionId ? "opacity-40" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-gray-600">
              {selectedCandidate?.name?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <select
                value={selectedCandidateId ?? ""}
                onChange={(e) =>
                  setSelectedCandidateId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={!selectedPositionId}
                className="w-full text-[13px] font-semibold text-gray-800 bg-transparent outline-none cursor-pointer appearance-none disabled:cursor-not-allowed"
              >
                <option value="">지원자를 선택하세요</option>
                {filteredCandidates.map((cnd) => (
                  <option key={cnd.candidate_id} value={cnd.candidate_id}>
                    {cnd.name} · {cnd.experience_level}
                  </option>
                ))}
              </select>
            </div>
            <i className="bx bx-chevron-down text-gray-400 text-xl flex-shrink-0 pointer-events-none" />
          </div>
        </div>

        {/* AI 질문 생성 버튼 */}
        <button
          type="button"
          onClick={onGenerateAI}
          disabled={isGenerating || !selectedPositionId || !selectedCandidateId}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <i className="bx bx-loader-alt bx-spin text-base" />
              생성 중...
            </>
          ) : (
            "✨ AI 질문 생성하기"
          )}
        </button>
      </div>
    </div>
  );
}
