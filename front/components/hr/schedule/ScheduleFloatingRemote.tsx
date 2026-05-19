"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export interface ScheduleFloatingRemoteProps {
  selectedDate: Date;
  selectedSlotIds: number[];
  selectedDayCount: number;
  isLoading: boolean;
  isSaving: boolean;
  isMinimized: boolean;
  /** 다른 모달이 열려 있을 때 false로 두면 Esc로 최소화하지 않음 */
  enableEscapeToMinimize?: boolean;
  onMinimize: () => void;
  onRestore: () => void;
  /** 일정 생성 + 예약 초대 통합 모달 진입 */
  onOpenOperations: () => void;
  onEdit: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
}

const remoteVariants = {
  hidden: { y: 24, opacity: 0, scale: 0.96 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
  exit: {
    y: 16,
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.16 },
  },
} as const;

const fabVariants = {
  hidden: { y: 16, opacity: 0, scale: 0.85 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 340, damping: 26 },
  },
  exit: { y: 16, opacity: 0, scale: 0.85, transition: { duration: 0.14 } },
} as const;

const actionRowVariants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.16 },
  },
} as const;

interface RemoteActionButton {
  key: string;
  label: string;
  icon: string;
  variant: "primary" | "ghost" | "danger" | "accent";
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

const VARIANT_CLASS: Record<RemoteActionButton["variant"], string> = {
  primary: "bg-white text-slate-900 hover:bg-slate-100 ring-1 ring-white/40",
  ghost: "bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/10",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
  accent: "bg-indigo-500 text-white hover:bg-indigo-400",
};

function RemoteButton({ action }: { action: RemoteActionButton }) {
  return (
    <button
      type="button"
      onClick={() => void action.onClick()}
      disabled={action.disabled || action.loading}
      className={`inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2.5 text-[11px] font-black transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:px-3 sm:text-xs ${VARIANT_CLASS[action.variant]}`}
    >
      <i
        className={`bx text-sm sm:text-base ${
          action.loading ? "bx-loader-alt animate-spin" : action.icon
        }`}
      />
      <span className="whitespace-nowrap">{action.label}</span>
    </button>
  );
}

export function ScheduleFloatingRemote({
  selectedDate,
  selectedSlotIds,
  selectedDayCount,
  isLoading,
  isSaving,
  isMinimized,
  enableEscapeToMinimize = true,
  onMinimize,
  onRestore,
  onOpenOperations,
  onEdit,
  onDelete,
  onRefresh,
  onNavigatePrev,
  onNavigateNext,
}: ScheduleFloatingRemoteProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isMinimized || !enableEscapeToMinimize) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onMinimize();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, isMinimized, enableEscapeToMinimize, onMinimize]);

  if (!mounted) return null;

  const selectedCount = selectedSlotIds.length;
  const singleSelected = selectedCount === 1;
  const hasSelection = selectedCount > 0;

  const primaryActions: RemoteActionButton[] = [
    {
      key: "operations",
      label: "일정·초대",
      icon: "bx-calendar-plus",
      variant: "primary",
      onClick: onOpenOperations,
    },
    {
      key: "refresh",
      label: "새로고침",
      icon: "bx-refresh",
      variant: "ghost",
      onClick: onRefresh,
      loading: isLoading,
    },
  ];

  const selectionActions: RemoteActionButton[] = singleSelected
    ? [
        {
          key: "edit",
          label: "수정",
          icon: "bx-edit",
          variant: "accent",
          onClick: onEdit,
          disabled: isSaving,
        },
        {
          key: "delete",
          label: "삭제",
          icon: "bx-trash",
          variant: "danger",
          onClick: onDelete,
          disabled: isSaving,
        },
      ]
    : [
        {
          key: "delete-multi",
          label: `${selectedCount}건 삭제`,
          icon: "bx-trash",
          variant: "danger",
          onClick: onDelete,
          disabled: isSaving,
        },
      ];

  const fab = (
    <motion.button
      key="remote-fab"
      type="button"
      variants={fabVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onRestore}
      className="pointer-events-auto fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/65 px-3 py-2 text-white shadow-xl ring-1 ring-black/10 backdrop-blur-2xl backdrop-saturate-150 transition hover:bg-slate-900/80 sm:bottom-5 sm:right-5"
      aria-label="리모콘 펼치기"
      title="리모콘 펼치기"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
        <i className="bx bxs-joystick text-base" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
          Remote
        </span>
        <span className="text-[11px] font-black">
          {format(selectedDate, "M/d (EEE)", { locale: ko })}
        </span>
      </span>
      {hasSelection ? (
        <span className="ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-indigo-500/25 px-1.5 py-0.5 text-[10px] font-black text-indigo-200">
          <i className="bx bx-check-circle text-[10px]" />
          {selectedCount}
        </span>
      ) : null}
    </motion.button>
  );

  const fullRemote = (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
      <motion.section
        key="remote-full"
        variants={remoteVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-slate-900/55 text-white shadow-[0_16px_48px_-12px_rgba(15,23,42,0.55)] ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150"
        role="toolbar"
        aria-label="일정 리모콘"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
        />

        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/15">
              <i className="bx bxs-joystick text-sm" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black text-white sm:text-xs">
                {format(selectedDate, "M.d (EEE)", { locale: ko })}
                <span className="ml-1.5 text-[10px] font-bold text-slate-400">
                  · {selectedDayCount}건
                </span>
                {hasSelection ? (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-indigo-500/25 px-1.5 py-0.5 text-[9px] font-black text-indigo-200">
                    <i className="bx bx-check-circle text-[10px]" />
                    {selectedCount}
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onNavigatePrev}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
              aria-label="이전 기간"
            >
              <i className="bx bx-chevron-left text-base" />
            </button>
            <button
              type="button"
              onClick={onNavigateNext}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
              aria-label="다음 기간"
            >
              <i className="bx bx-chevron-right text-base" />
            </button>
            <span className="mx-1 h-4 w-px bg-white/15" />
            <button
              type="button"
              onClick={onMinimize}
              className="flex h-7 items-center gap-1 rounded-lg bg-white/10 px-2 text-[10px] font-black text-white transition hover:bg-white/20"
              aria-label="리모콘 최소화"
              title="Esc로도 최소화"
            >
              <i className="bx bx-minus text-sm" />
              <kbd className="hidden rounded bg-black/30 px-1 text-[9px] font-black uppercase tracking-wider text-slate-300 sm:inline">
                Esc
              </kbd>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 px-3 py-2">
          {primaryActions.map((action) => (
            <RemoteButton key={action.key} action={action} />
          ))}
        </div>

        <AnimatePresence initial={false}>
          {hasSelection ? (
            <motion.div
              key="selection-bar"
              variants={actionRowVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="overflow-hidden border-t border-white/10 bg-linear-to-r from-indigo-500/20 via-fuchsia-500/15 to-rose-500/20"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-200">
                  선택 일정 작업
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectionActions.map((action) => (
                    <RemoteButton key={action.key} action={action} />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.section>
    </div>
  );

  return createPortal(
    <AnimatePresence mode="wait" initial={false}>
      {isMinimized ? fab : fullRemote}
    </AnimatePresence>,
    document.body,
  );
}
