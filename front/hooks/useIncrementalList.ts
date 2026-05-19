"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface UseIncrementalListResult<T> {
  /** 현재까지 노출된 슬라이스 */
  visible: T[];
  /** 전체 개수 */
  total: number;
  /** 노출된 개수 */
  visibleCount: number;
  /** 더 불러올 항목이 남았는지 */
  hasMore: boolean;
  /** 다음 페이지 노출 */
  loadMore: () => void;
  /** 노출 카운트 초기화 (resetKey 변경 시 자동 호출됨) */
  reset: () => void;
}

export interface UseIncrementalListOptions {
  /** 1회 노출 크기 (기본 10) */
  pageSize?: number;
  /** 값이 바뀌면 노출 카운트가 1페이지로 초기화됩니다. */
  resetKey?: string | number;
}

/**
 * 클라이언트 메모리 배열을 페이지 단위로 잘라 인피니트 스크롤에 노출하는 훅.
 * 백엔드 추가 호출 없이 이미 받은 배열을 점진 렌더링합니다.
 */
export function useIncrementalList<T>(
  items: T[],
  { pageSize = 10, resetKey }: UseIncrementalListOptions = {},
): UseIncrementalListResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const [count, setCount] = useState(safePageSize);

  useEffect(() => {
    setCount(safePageSize);
  }, [resetKey, safePageSize]);

  useEffect(() => {
    if (count > items.length) {
      setCount(Math.max(safePageSize, items.length));
    }
  }, [count, items.length, safePageSize]);

  const visible = useMemo(
    () => items.slice(0, Math.min(count, items.length)),
    [items, count],
  );

  const hasMore = count < items.length;

  const loadMore = useCallback(() => {
    setCount((prev) => Math.min(prev + safePageSize, items.length));
  }, [items.length, safePageSize]);

  const reset = useCallback(() => {
    setCount(safePageSize);
  }, [safePageSize]);

  return {
    visible,
    total: items.length,
    visibleCount: visible.length,
    hasMore,
    loadMore,
    reset,
  };
}
