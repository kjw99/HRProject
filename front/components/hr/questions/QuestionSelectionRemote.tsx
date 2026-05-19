"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export interface QuestionSelectionRemoteProps {
  selectedCount: number;
  isDeleting: boolean;
  onClearSelection: () => void;
  onRequestDelete: () => void;
}

export default function QuestionSelectionRemote({
  selectedCount,
  isDeleting,
  onClearSelection,
  onRequestDelete,
}: QuestionSelectionRemoteProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {selectedCount > 0 ? (
        <motion.div
          key="question-selection-remote"
          initial={{ opacity: 0, y: 24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 16, x: "-50%" }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-80 w-[min(100vw-2rem,420px)]"
          role="toolbar"
          aria-label="선택한 질문 작업"
        >
          <motion.div
            layout
            className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/95 px-3 py-2.5 text-white shadow-2xl shadow-slate-900/40 ring-1 ring-white/10 backdrop-blur-md sm:gap-3 sm:px-4 sm:py-3"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 pl-1">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/90 text-sm font-black tabular-nums">
                {selectedCount}
              </span>
              <span className="truncate text-xs font-bold text-slate-200 sm:text-sm">
                {selectedCount === 1 ? "질문 1개 선택" : `질문 ${selectedCount}개 선택`}
              </span>
            </span>

            <button
              type="button"
              disabled={isDeleting}
              onClick={onClearSelection}
              className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              선택 해제
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={onRequestDelete}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-black text-white shadow-lg shadow-rose-900/30 transition hover:bg-rose-600 disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              {isDeleting ? (
                <i className="bx bx-loader-alt animate-spin text-base" aria-hidden />
              ) : (
                <i className="bx bx-trash text-base" aria-hidden />
              )}
              삭제
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
