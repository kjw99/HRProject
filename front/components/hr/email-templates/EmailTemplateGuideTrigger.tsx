"use client";

import { useCallback, useEffect, useState } from "react";
import EmailTemplateGuideModal from "./EmailTemplateGuideModal";
import { EMAIL_TEMPLATE_GUIDE_DISMISS_KEY } from "./email-template.constants";

interface EmailTemplateGuideTriggerProps {
  /** 첫 방문 시 자동으로 모달을 띄울지 여부 (기본 true) */
  autoOpenOnFirstVisit?: boolean;
}

/**
 * "템플릿 제작 가이드" 모달의 진입점.
 *
 * UX 정책
 * - 첫 방문(localStorage에 dismiss 기록 없음) 시 자동 오픈
 * - 사용자가 "다시 보지 않기"를 체크하면 다음부터는 자동 오픈하지 않음
 * - 언제든 다시 보기 버튼으로 재오픈 가능 (자동 오픈 비활성화와 무관)
 * - localStorage 접근은 mount 이후에만 → SSR/hydration 충돌 방지
 */
export default function EmailTemplateGuideTrigger({
  autoOpenOnFirstVisit = true,
}: EmailTemplateGuideTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let dismissed = false;
    try {
      dismissed =
        window.localStorage.getItem(EMAIL_TEMPLATE_GUIDE_DISMISS_KEY) === "1";
    } catch {
      /* 저장소 접근 불가(시크릿/권한 등)는 무시하고 기본 동작 */
    }

    setDontShowAgain(dismissed);
    if (autoOpenOnFirstVisit && !dismissed) {
      setIsOpen(true);
    }
  }, [autoOpenOnFirstVisit]);

  const persistDismissed = useCallback((next: boolean) => {
    setDontShowAgain(next);
    if (typeof window === "undefined") return;
    try {
      if (next) {
        window.localStorage.setItem(EMAIL_TEMPLATE_GUIDE_DISMISS_KEY, "1");
      } else {
        window.localStorage.removeItem(EMAIL_TEMPLATE_GUIDE_DISMISS_KEY);
      }
    } catch {
      /* 저장 실패는 사용자 흐름을 막지 않음 */
    }
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleOpen = useCallback(() => setIsOpen(true), []);

  return (
    <>
      {/* 히어로 ↔ 매니저 사이에 슬림 배너 형태로 자리잡는 trigger */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-linear-to-r from-amber-50 via-amber-50/60 to-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
            <i className="bx bx-book-open text-xl" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 sm:text-base">
              템플릿 제작이 처음이라면?
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500 sm:text-sm">
              네 단계로 정리된 가이드를 모달로 빠르게 확인하세요.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-black text-amber-700 shadow-sm transition hover:bg-amber-50 sm:self-auto"
        >
          <i className="bx bx-help-circle text-base" />
          제작 가이드 보기
        </button>
      </div>

      <EmailTemplateGuideModal
        isOpen={isOpen}
        onClose={handleClose}
        dontShowAgain={dontShowAgain}
        onToggleDontShowAgain={persistDismissed}
      />
    </>
  );
}
