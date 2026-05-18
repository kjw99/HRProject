"use client";

interface ApplicantDetailActionBarProps {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ApplicantDetailActionBar({
  onEdit,
  onDelete,
  onClose,
}: ApplicantDetailActionBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
      >
        <i className="bx bx-edit text-lg" />
        수정
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-black text-rose-700 transition hover:bg-rose-100"
      >
        <i className="bx bx-trash text-lg" />
        삭제
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
      >
        닫기
      </button>
    </div>
  );
}
