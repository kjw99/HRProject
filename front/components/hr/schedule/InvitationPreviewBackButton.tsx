"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BackMode = "close-window" | "history-back" | "fallback";

interface InvitationPreviewBackButtonProps {
  /** 새 창/탭이 아니거나 history가 없을 때 이동할 경로 */
  fallbackHref?: string;
}

/**
 * 초대 미리보기 뒤로가기 버튼.
 *
 * - 이 페이지는 일반 라우팅 외에 ScheduleBookingModal에서 popup으로 열리기도 한다.
 *   따라서 단순 router.back() 만 호출하면 빈 history에서 동작하지 않거나
 *   새 창에 빈 화면이 남는 문제가 발생한다.
 *
 * 동작 우선순위
 * 1) window.opener 존재  → 새 창에서 열림  → window.close() ("창 닫기")
 * 2) history.length > 1  → 일반 탭         → router.back()   ("뒤로 가기")
 * 3) 둘 다 아닌 경우      → fallback 라우트   ("일정 페이지로")
 *
 * SSR 안전: mount 이후에만 환경을 감지하여 라벨/모드 결정 → hydration mismatch 방지.
 */
function InvitationPreviewBackButtonImpl({
  fallbackHref = "/hr/schedule",
}: InvitationPreviewBackButtonProps) {
  const router = useRouter();
  const [mode, setMode] = useState<BackMode>("fallback");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const openedFromAnotherWindow = Boolean(
      window.opener && !window.opener.closed,
    );

    if (openedFromAnotherWindow) {
      setMode("close-window");
    } else if (window.history.length > 1) {
      setMode("history-back");
    } else {
      setMode("fallback");
    }
  }, []);

  const handleClick = useCallback(() => {
    if (typeof window === "undefined") return;

    switch (mode) {
      case "close-window":
        window.close();
        return;
      case "history-back":
        router.back();
        return;
      case "fallback":
      default:
        router.push(fallbackHref);
    }
  }, [fallbackHref, mode, router]);

  const label = LABELS[mode];
  const icon = ICONS[mode];
  const aria = ARIA_LABELS[mode];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={aria}
      title={aria}
      className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-slate-300 hover:text-slate-900 active:translate-x-0 sm:text-sm"
    >
      <i
        className={`bx ${icon} text-base transition-transform group-hover:-translate-x-0.5`}
      />
      {label}
    </button>
  );
}

const LABELS: Record<BackMode, string> = {
  "close-window": "창 닫기",
  "history-back": "뒤로 가기",
  fallback: "일정으로",
};

const ICONS: Record<BackMode, string> = {
  "close-window": "bx-x",
  "history-back": "bx-arrow-back",
  fallback: "bx-home-alt",
};

const ARIA_LABELS: Record<BackMode, string> = {
  "close-window": "초대 미리보기 창 닫기",
  "history-back": "이전 페이지로 돌아가기",
  fallback: "일정 페이지로 이동",
};

export const InvitationPreviewBackButton = memo(InvitationPreviewBackButtonImpl);
export default InvitationPreviewBackButton;
