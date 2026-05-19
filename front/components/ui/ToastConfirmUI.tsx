"use client";

import { toast } from "sonner";

export type ToastConfirmTone = "danger" | "default";

export interface ToastConfirmUIProps {
  t: string | number;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ToastConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE_STYLES: Record<
  ToastConfirmTone,
  { iconWrap: string; icon: string; confirmBtn: string }
> = {
  danger: {
    iconWrap: "bg-rose-50 text-rose-600",
    icon: "bx-error-circle",
    confirmBtn:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/30",
  },
  default: {
    iconWrap: "bg-indigo-50 text-indigo-600",
    icon: "bx-help-circle",
    confirmBtn:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500/30",
  },
};

/**
 * sonner `toast.custom` 용 확인/취소 토스트.
 * `duration: Infinity` 로 띄우고, 버튼 클릭 시 `toast.dismiss(t)` 호출.
 */
export function ToastConfirmUI({
  t,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "default",
  onConfirm,
  onCancel,
}: ToastConfirmUIProps) {
  const styles = TONE_STYLES[tone];

  const handleCancel = () => {
    onCancel();
    toast.dismiss(t);
  };

  const handleConfirm = () => {
    onConfirm();
    toast.dismiss(t);
  };

  return (
    <div
      className="pointer-events-auto flex w-[min(100vw-2rem,400px)] flex-col gap-3 rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-2xl shadow-slate-200/50 sm:p-5"
      role="alertdialog"
      aria-labelledby="toast-confirm-title"
      aria-describedby={message ? "toast-confirm-desc" : undefined}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-inner ${styles.iconWrap}`}
        >
          <i className={`bx ${styles.icon} text-2xl`} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p
            id="toast-confirm-title"
            className="text-sm font-black text-slate-900 sm:text-base"
          >
            {title}
          </p>
          {message ? (
            <p
              id="toast-confirm-desc"
              className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm"
            >
              {message}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="shrink-0 text-slate-300 transition hover:text-slate-500"
          aria-label="닫기"
        >
          <i className="bx bx-x text-xl" />
        </button>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 ${styles.confirmBtn}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}