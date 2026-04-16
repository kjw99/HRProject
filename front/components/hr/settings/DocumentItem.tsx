import { Document } from "@/types/hr";

export default function DocumentItem({
  doc,
  onRemove,
}: {
  doc: Document;
  onRemove: () => void;
}) {
  const isError = doc.status === "error";
  const isUploading = doc.status === "uploading";

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-slate-300 hover:shadow-sm rounded-[20px] transition-all group">
      <div className="flex items-center gap-4 overflow-hidden flex-1">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-[22px] shrink-0 ${isUploading ? "bg-slate-50 text-slate-400" : isError ? "bg-rose-50 text-rose-500" : "bg-indigo-50 text-indigo-500"}`}
        >
          {isUploading ? (
            <i className="bx bx-loader-alt bx-spin"></i>
          ) : isError ? (
            <i className="bx bx-error"></i>
          ) : (
            <i className="bx bxs-file-pdf"></i>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[14px] text-slate-800 truncate mb-0.5">
            {doc.name}
          </p>
          {isUploading ? (
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${doc.progress}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-black text-indigo-500">
                {doc.progress}%
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isError ? "bg-rose-400" : "bg-emerald-400"}`}
              ></span>
              {isError ? "업로드 실패" : `완료 • ${doc.size}`}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <i className="bx bx-trash text-[18px]"></i>
      </button>
    </div>
  );
}
