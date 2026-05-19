"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from "react";
import {
  measureCaretPosition,
  type CaretMeasurement,
} from "./caret-position";

type EditableElement = HTMLInputElement | HTMLTextAreaElement;

/** 자동완성 트리거가 감지된 상태 */
export interface AutocompleteTrigger {
  /** "{" 의 위치 (inclusive) */
  startIndex: number;
  /** 커서 위치 (exclusive) */
  endIndex: number;
  /** "{" 뒤에 입력된 토큰 (영문/숫자/언더스코어) */
  query: string;
}

export interface AutocompleteSuggestion {
  /** 변수 키 (중괄호 미포함). 예: "candidate_name" */
  value: string;
  /** 부가 설명/예시 등 옵션 메타 */
  hint?: string;
}

export interface UseTemplateVariableAutocompleteOptions<
  T extends EditableElement,
> {
  /** 입력 필드 현재 값 */
  value: string;
  /** 값 변경 콜백 — 폼 상태에 반영 */
  onChange: (next: string) => void;
  /** 후보 변수 목록 (정렬 전, 원본 순서 무관) */
  variables: readonly AutocompleteSuggestion[];
  /** 외부에서 ref가 필요하면 전달, 없으면 내부 ref 생성 */
  externalRef?: RefObject<T | null>;
  /** 후보가 0개일 때 dropdown 표시 여부 (기본 false → 숨김) */
  showWhenNoMatch?: boolean;
}

export interface AutocompleteUiState {
  isOpen: boolean;
  query: string;
  suggestions: AutocompleteSuggestion[];
  activeIndex: number;
  /** 캐럿(텍스트 커서) viewport 좌표. null이면 fallback 배치 */
  caret: CaretMeasurement | null;
  onHover: (index: number) => void;
  onPick: (index: number) => void;
}

export interface UseTemplateVariableAutocompleteReturn<T extends EditableElement> {
  inputRef: RefObject<T | null>;
  onChange: (event: ChangeEvent<T>) => void;
  onKeyDown: (event: ReactKeyboardEvent<T>) => void;
  onBlur: () => void;
  /** dropdown 컴포넌트로 그대로 전달 */
  state: AutocompleteUiState;
}

const TOKEN_CHAR_PATTERN = /[a-zA-Z0-9_]/;

/**
 * 커서 좌측에서 가장 가까운 미닫힌 `{` 를 찾아 트리거 여부를 판정한다.
 * - "{" 와 커서 사이에는 토큰 문자만 허용 (공백/숫자 외 기호/`}` 등이 있으면 트리거 무효)
 * - "{" 가 없거나 닫힌 변수 안이라면 null
 */
export function detectAutocompleteTrigger(
  value: string,
  cursor: number,
): AutocompleteTrigger | null {
  if (cursor < 0 || cursor > value.length) return null;

  for (let i = cursor - 1; i >= 0; i -= 1) {
    const ch = value[i];
    if (ch === "{") {
      const query = value.slice(i + 1, cursor);
      // "{ candidate}" 처럼 공백/특수문자 들어간 케이스는 자동완성 대상 아님
      if (query.length > 0 && !/^[a-zA-Z0-9_]+$/.test(query)) return null;
      return { startIndex: i, endIndex: cursor, query };
    }
    if (ch === "}" || ch === "{" || !TOKEN_CHAR_PATTERN.test(ch)) {
      return null;
    }
  }
  return null;
}

/**
 * 후보 필터링: prefix 매칭 우선 → contains 매칭, 둘 다 case-insensitive.
 * 빈 query면 전체 반환.
 */
export function filterSuggestions(
  variables: readonly AutocompleteSuggestion[],
  query: string,
): AutocompleteSuggestion[] {
  if (!query) return [...variables];
  const lower = query.toLowerCase();
  const prefix: AutocompleteSuggestion[] = [];
  const contains: AutocompleteSuggestion[] = [];

  for (const item of variables) {
    const target = item.value.toLowerCase();
    if (target.startsWith(lower)) {
      prefix.push(item);
    } else if (target.includes(lower)) {
      contains.push(item);
    }
  }
  return [...prefix, ...contains];
}

/**
 * 트리거 구간을 `{value}` 로 치환하여 새 문자열과 다음 커서 위치를 반환.
 * - 트리거 직후에 이미 `}` 가 있다면 중복 삽입을 방지.
 */
export function applySuggestionToValue(
  value: string,
  trigger: AutocompleteTrigger,
  picked: string,
): { value: string; cursor: number } {
  const afterEnd = value.slice(trigger.endIndex);
  const hasClosing = afterEnd.startsWith("}");

  const insertion = hasClosing ? `{${picked}` : `{${picked}}`;
  const next = value.slice(0, trigger.startIndex) + insertion + afterEnd;

  // 커서를 닫는 `}` 바로 뒤로 위치
  const cursor =
    trigger.startIndex + insertion.length + (hasClosing ? 1 : 0);

  return { value: next, cursor };
}

/**
 * 인풋/텍스트영역에 `{변수}` 자동완성을 붙이는 헤드리스 훅.
 *
 * 사용 예
 * ```tsx
 * const ac = useTemplateVariableAutocomplete<HTMLInputElement>({ value, onChange, variables });
 * <input ref={ac.inputRef} value={value} onChange={ac.onChange} onKeyDown={ac.onKeyDown} onBlur={ac.onBlur} />
 * <TemplateVariableSuggestionList state={ac.state} />
 * ```
 */
export function useTemplateVariableAutocomplete<T extends EditableElement>({
  value,
  onChange,
  variables,
  externalRef,
  showWhenNoMatch = false,
}: UseTemplateVariableAutocompleteOptions<T>): UseTemplateVariableAutocompleteReturn<T> {
  const internalRef = useRef<T | null>(null);
  const inputRef = externalRef ?? internalRef;

  const [trigger, setTrigger] = useState<AutocompleteTrigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caret, setCaret] = useState<CaretMeasurement | null>(null);

  /** 다음 onChange 후 setSelectionRange로 복원할 커서 위치 */
  const pendingCaretRef = useRef<number | null>(null);

  const suggestions = useMemo(
    () => (trigger ? filterSuggestions(variables, trigger.query) : []),
    [trigger, variables],
  );

  const isOpen = Boolean(
    trigger && (suggestions.length > 0 || showWhenNoMatch),
  );

  // 후보 목록이 줄거나 늘면 activeIndex 범위 보정
  useEffect(() => {
    if (!isOpen) {
      if (activeIndex !== 0) setActiveIndex(0);
      return;
    }
    if (activeIndex >= suggestions.length) {
      setActiveIndex(suggestions.length === 0 ? 0 : suggestions.length - 1);
    }
  }, [activeIndex, isOpen, suggestions.length]);

  /**
   * dropdown 이 열려 있는 동안 스크롤/리사이즈가 발생하면
   * 캐럿이 함께 이동하므로 좌표를 재측정한다.
   * (rAF로 throttle 하여 과도한 측정 비용을 방지)
   */
  useEffect(() => {
    if (!trigger) return;
    const el = inputRef.current;
    if (!el) return;

    let frame = 0;
    const reposition = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setCaret(measureCaretPosition(el, trigger.endIndex));
      });
    };

    // 즉시 1회 측정 (input 폭 / 라인이 바뀌었을 수 있음)
    reposition();

    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [inputRef, trigger]);

  // 트리거 해제 시 좌표도 초기화 (다음 트리거 시 깜빡임 방지)
  useEffect(() => {
    if (!trigger) setCaret(null);
  }, [trigger]);

  // 보류 중인 커서 위치 복원 (onChange 이후 ref 갱신을 기다린다)
  useEffect(() => {
    if (pendingCaretRef.current === null) return;
    const el = inputRef.current;
    if (!el) return;
    const pos = pendingCaretRef.current;
    pendingCaretRef.current = null;
    try {
      el.setSelectionRange(pos, pos);
    } catch {
      /* selection 미지원 환경 */
    }
  }, [inputRef, value]);

  const updateTriggerFromEvent = useCallback(
    (nextValue: string, selectionStart: number | null) => {
      if (selectionStart == null) {
        setTrigger(null);
        return;
      }
      const found = detectAutocompleteTrigger(nextValue, selectionStart);
      setTrigger(found);
      if (found) {
        setActiveIndex(0);
        // 캐럿 좌표는 다음 layout 이후가 더 정확하므로 effect에서 재측정.
        // 다만 첫 프레임이 비어 보이지 않도록 즉시 한 번 측정 시도.
        const el = inputRef.current;
        if (el) setCaret(measureCaretPosition(el, found.endIndex));
      }
    },
    [inputRef],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<T>) => {
      const next = event.target.value;
      onChange(next);
      updateTriggerFromEvent(next, event.target.selectionStart);
    },
    [onChange, updateTriggerFromEvent],
  );

  const pickAt = useCallback(
    (index: number) => {
      if (!trigger) return;
      const picked = suggestions[index];
      if (!picked) return;

      const result = applySuggestionToValue(value, trigger, picked.value);
      pendingCaretRef.current = result.cursor;
      onChange(result.value);
      setTrigger(null);
    },
    [onChange, suggestions, trigger, value],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<T>) => {
      if (!isOpen) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) =>
          suggestions.length === 0 ? 0 : (prev + 1) % suggestions.length,
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) =>
          suggestions.length === 0
            ? 0
            : (prev - 1 + suggestions.length) % suggestions.length,
        );
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        if (suggestions.length === 0) return;
        event.preventDefault();
        pickAt(activeIndex);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setTrigger(null);
      }
    },
    [activeIndex, isOpen, pickAt, suggestions.length],
  );

  const handleBlur = useCallback(() => {
    // mousedown으로 픽업되도록 약간의 딜레이를 둠
    window.setTimeout(() => setTrigger(null), 120);
  }, []);

  return {
    inputRef,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    state: {
      isOpen,
      query: trigger?.query ?? "",
      suggestions,
      activeIndex,
      caret,
      onHover: setActiveIndex,
      onPick: pickAt,
    },
  };
}
