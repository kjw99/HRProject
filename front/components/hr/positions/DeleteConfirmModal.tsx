import React, { useState, useEffect } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  targetName: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetName,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 cursor-default"
      >
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 text-rose-500">
          <i className="bx bx-error text-3xl"></i>
        </div>

        <h2 className="text-[16px] font-black text-slate-800 mb-2">
          직무 삭제 확인
        </h2>
        <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6">
          정말{" "}
          <strong className="text-slate-800">&apos;{targetName}&apos;</strong>{" "}
          직무를 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 없습니다.
        </p>

        <div className="flex w-full gap-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[13px] font-black transition-all shadow-md shadow-rose-200 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isDeleting ? (
              <i className="bx bx-loader-alt bx-spin text-lg" />
            ) : (
              "삭제하기"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
