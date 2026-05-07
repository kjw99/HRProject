import { FloatingActionBarProps } from "@/types/admin";

export default function FloatingActionBar({
  selectedCount,
  onDownload,
  onDelete,
  onClearSelection,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    // 💡 1. 모바일에서는 하단 여백을 줄이고(bottom-6), 좌우 화면을 뚫고 나가지 않게 max-w-[90vw] 설정
    <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-40 w-max max-w-[95vw] animate-in slide-in-from-bottom-8 fade-in duration-300">

      {/* 💡 2. 그림자 깊이감을 더 깊게(shadow-2xl 급) 주고, 모바일/데스크탑 패딩 분리 */}
      <div className="bg-white/90 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200/80 rounded-full px-4 py-2.5 md:px-6 md:py-3 flex items-center gap-2 md:gap-4">

        {/* 선택 카운터 영역 */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 whitespace-nowrap pl-1 md:pl-0">
          <span className="flex items-center justify-center bg-indigo-600 text-white w-6 h-6 rounded-full text-xs shadow-sm">
            {selectedCount}
          </span>
          {/* 모바일에서는 '명 선택됨' 글자를 숨겨서 공간 절약 */}
          <span className="hidden sm:inline">명 선택됨</span>
        </div>

        {/* 세로 구분선 (모바일에서는 숨김) */}
        <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

        {/* 액션 버튼 그룹 */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={onDownload}
            // 💡 3. 버튼에 hover:scale-105 active:scale-95 를 추가해 누르는 맛(조작감) 극대화
            className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            <i className="bx bx-download text-lg"></i>
            <span className="hidden sm:inline">엑셀 저장</span>
            <span className="sm:hidden">엑셀</span>
          </button>

          <button
            onClick={onDelete}
            // 💡 4. 삭제 버튼에 빨간색 미세한 그림자(shadow-rose-500/30)를 주어 강조
            className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2 bg-rose-500 text-white rounded-full text-sm font-bold shadow-sm shadow-rose-500/30 hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            <i className="bx bx-trash text-lg"></i>
            <span className="hidden sm:inline">선택 삭제</span>
            <span className="sm:hidden">삭제</span>
          </button>
        </div>

        {/* 선택 취소 버튼 */}
        <button
          onClick={onClearSelection}
          className="p-1.5 md:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors active:scale-90 ml-1 shrink-0"
          title="선택 취소"
        >
          <i className="bx bx-x text-xl md:text-2xl"></i>
        </button>
      </div>
    </div>
  );
}