"use client";

import { useEffect, useState } from "react";

export interface QuestionDeleteConfirmModalProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function QuestionDeleteConfirmModal({
  isOpen,
  count,
  onClose,
  onConfirm,
}: QuestionDeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-[24px] bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-500">
          <i className="bx bx-error text-3xl" aria-hidden />
        </div>
        <h2 className="mb-2 text-base font-black text-slate-800">질문 삭제 확인</h2>
        <p className="mb-6 text-[13px] font-medium leading-relaxed text-slate-500">
          선택한{" "}
          <strong className="text-slate-800">
            {count === 1 ? "질문 1개" : `질문 ${count}개`}
          </strong>
          를 삭제하시겠습니까?
          <br />
          이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-rose-500 py-3 text-[13px] font-black text-white transition hover:bg-rose-600 disabled:opacity-50"
          >
            {isDeleting ? "삭제 중…" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
