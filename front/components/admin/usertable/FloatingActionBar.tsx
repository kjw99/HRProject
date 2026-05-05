import { FloatingActionBarProps } from "@/types/admin";

export default function FloatingActionBar({
  selectedCount,
  onDownload,
  onDelete,
  onClearSelection,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-white/80 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200 rounded-full px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full text-xs">
            {selectedCount}
          </span>
          명 선택됨
        </div>

        <div className="w-px h-5 bg-slate-300"></div>

        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold hover:bg-indigo-100 transition-all"
        >
          <i className="bx bx-file-blank text-lg"></i> 엑셀 저장
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-full text-sm font-bold shadow-sm hover:bg-rose-600 hover:-translate-y-0.5 transition-all"
        >
          <i className="bx bx-trash text-lg"></i> 선택 삭제
        </button>

        <button
          onClick={onClearSelection}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-1"
          title="선택 취소"
        >
          <i className="bx bx-x text-xl"></i>
        </button>
      </div>
    </div>
  );
}
