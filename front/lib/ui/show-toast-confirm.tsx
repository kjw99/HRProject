"use client";

import { toast } from "sonner";
import {
  ToastConfirmUI,
  type ToastConfirmTone,
} from "@/components/ui/ToastConfirmUI";

export interface ShowToastConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ToastConfirmTone;
  /** 동일 id 로 중복 confirm 방지 (선택) */
  toastId?: string;
}

/**
 * Promise 기반 확인 토스트.
 * - 확인: true, 취소/닫기: false
 * - 자동 닫힘 없음 (`duration: Infinity`)
 */
export function showToastConfirm(
  options: ShowToastConfirmOptions,
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    toast.custom(
      (t) => (
        <ToastConfirmUI
          t={t}
          title={options.title}
          message={options.message}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          tone={options.tone}
          onConfirm={() => finish(true)}
          onCancel={() => finish(false)}
        />
      ),
      {
        duration: Infinity,
        ...(options.toastId ? { id: options.toastId } : {}),
        onDismiss: () => finish(false),
      },
    );
  });
}
