"use client";

import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AutocompleteUiState } from "./useTemplateVariableAutocomplete";

export interface TemplateVariableSuggestionListProps {
  state: AutocompleteUiState;
}

interface ResolvedPosition {
  top: number;
  left: number;
  width: number;
  /** 캐럿 위에 띄웠는지 여부 (애니메이션 방향용) */
  placement: "below" | "above";
}

/** dropdown 의 의도된(예측) 크기 — clamp 계산용. 실제 측정값이 들어오면 그것을 사용 */
const DEFAULT_DROPDOWN_WIDTH = 280;
const DEFAULT_DROPDOWN_MAX_HEIGHT = 240;
const VIEWPORT_PADDING = 12;
/** 모바일에서 화면 폭에 가깝게 띄울 임계값 */
const NARROW_VIEWPORT_BREAKPOINT = 640;

function TemplateVariableSuggestionListImpl({
  state,
}: TemplateVariableSuggestionListProps) {
  const { isOpen, query, suggestions, activeIndex, caret, onHover, onPick } =
    state;

  const listRef = useRef<HTMLUListElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [resolved, setResolved] = useState<ResolvedPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 키보드 네비게이션 시 활성 항목이 화면에 보이도록 스크롤
  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    if (!list) return;
    const active = list.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen, suggestions.length]);

  /**
   * 캐럿 좌표 + 실제 dropdown 크기를 바탕으로 fixed 좌표를 계산.
   * - 좌/우 viewport 경계에 부딪히면 안쪽으로 clamp
   * - 아래 공간이 부족하면 캐럿 위로 flip
   * - 좁은 화면(모바일)에서는 화면 폭의 92% 까지 늘려 줌
   */
  useLayoutEffect(() => {
    if (!isOpen) {
      setResolved(null);
      return;
    }
    if (!caret) return;

    const dropdownEl = containerRef.current;
    const measuredWidth =
      dropdownEl?.offsetWidth || DEFAULT_DROPDOWN_WIDTH;
    const measuredHeight =
      dropdownEl?.offsetHeight || DEFAULT_DROPDOWN_MAX_HEIGHT;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const isNarrow = viewportWidth < NARROW_VIEWPORT_BREAKPOINT;
    const targetWidth = isNarrow
      ? Math.min(measuredWidth, viewportWidth - VIEWPORT_PADDING * 2)
      : measuredWidth;

    // 좌측 위치: 모바일이면 화면 중앙 정렬, 데스크탑이면 캐럿 정렬
    let left = isNarrow
      ? (viewportWidth - targetWidth) / 2
      : caret.caretLeft;

    // 우측 경계 clamp
    left = Math.min(left, viewportWidth - targetWidth - VIEWPORT_PADDING);
    // 좌측 경계 clamp
    left = Math.max(left, VIEWPORT_PADDING);

    // 기본: 캐럿 한 줄 아래
    const belowTop = caret.caretTop + caret.lineHeight + 6;
    const spaceBelow = viewportHeight - belowTop;
    const spaceAbove = caret.caretTop;
    const fitsBelow = spaceBelow >= measuredHeight + VIEWPORT_PADDING;
    const fitsAbove = spaceAbove >= measuredHeight + VIEWPORT_PADDING;

    let placement: "below" | "above" = "below";
    let top = belowTop;

    if (!fitsBelow && fitsAbove) {
      placement = "above";
      top = caret.caretTop - measuredHeight - 6;
    } else if (!fitsBelow && !fitsAbove) {
      /**
       * 어느 쪽도 안 들어가면(예: 모바일 가상키보드로 시야가 좁음)
       * 더 넓은 쪽에 띄우고 max-height를 줄여 viewport 안쪽으로 강제로 밀어 넣는다.
       */
      if (spaceBelow >= spaceAbove) {
        placement = "below";
        top = Math.max(VIEWPORT_PADDING, belowTop);
      } else {
        placement = "above";
        top = VIEWPORT_PADDING;
      }
    }

    setResolved({ top, left, width: targetWidth, placement });
  }, [caret, isOpen, suggestions.length]);

  if (!isOpen || !mounted) return null;

  // 캐럿 좌표가 아직 측정 안 됐을 때는 화면 밖에 grant 으로 그려 깜빡임 방지
  const style: React.CSSProperties = resolved
    ? {
        position: "fixed",
        top: resolved.top,
        left: resolved.left,
        width: resolved.width,
        maxHeight: `min(${DEFAULT_DROPDOWN_MAX_HEIGHT}px, 70vh)`,
        zIndex: 1000,
      }
    : {
        position: "fixed",
        top: -9999,
        left: -9999,
        width: DEFAULT_DROPDOWN_WIDTH,
        zIndex: 1000,
        opacity: 0,
        pointerEvents: "none",
      };

  const placement = resolved?.placement ?? "below";

  return createPortal(
    <div
      ref={containerRef}
      style={style}
      role="listbox"
      aria-label="템플릿 변수 자동완성 후보"
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5 ${
        placement === "above"
          ? "animate-in fade-in slide-in-from-bottom-2"
          : "animate-in fade-in slide-in-from-top-2"
      } duration-150`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
        <span className="inline-flex items-center gap-1">
          <i className="bx bx-code-curly text-sm text-indigo-500" />
          변수 자동완성
        </span>
        <span className="font-bold normal-case text-slate-400">
          {`{${query || "..."}}`}
          <span className="ml-1 hidden sm:inline">
            ·{" "}
            <kbd className="rounded bg-white px-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200">
              ↑↓
            </kbd>
            /
            <kbd className="rounded bg-white px-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200">
              Enter
            </kbd>
          </span>
        </span>
      </div>

      {suggestions.length === 0 ? (
        <p className="px-3 py-3 text-xs font-semibold text-slate-400">
          일치하는 변수가 없어요. Esc로 닫을 수 있어요.
        </p>
      ) : (
        <ul
          ref={listRef}
          className="max-h-56 overflow-y-auto overscroll-contain py-1"
        >
          {suggestions.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={item.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  /**
                   * onMouseDown으로 처리해야 input의 onBlur가 발생하기 전에
                   * 선택 동작이 끝나서 dropdown이 닫히기 전에 값이 삽입된다.
                   * 모바일 touch는 touchstart로도 안전하게 처리.
                   */
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onPick(index);
                  }}
                  onTouchStart={(event) => {
                    event.preventDefault();
                    onPick(index);
                  }}
                  onMouseEnter={() => onHover(index)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <i
                      className={`bx bx-purchase-tag-alt text-base ${
                        isActive ? "text-indigo-500" : "text-slate-400"
                      }`}
                    />
                    <code
                      className={`truncate font-mono text-xs font-black ${
                        isActive ? "text-indigo-700" : "text-slate-800"
                      }`}
                    >
                      {`{${item.value}}`}
                    </code>
                  </span>
                  {item.hint ? (
                    <span className="truncate text-[11px] font-semibold text-slate-400">
                      {item.hint}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>,
    document.body,
  );
}

export const TemplateVariableSuggestionList = memo(
  TemplateVariableSuggestionListImpl,
);
export default TemplateVariableSuggestionList;
