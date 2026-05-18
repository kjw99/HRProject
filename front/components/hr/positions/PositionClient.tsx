"use client";
import { useRouter } from "next/navigation";
import { positionApi } from "@/lib/hr/positions.client";
import React, { useState, useMemo, useEffect } from "react";
import { Position } from "@/types/position";
import PositionTable from "./PositionTable";
import PositionFormModal from "./PositionFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { toast } from "sonner";
import { ToastUI } from "@/components/ui/ToastUI";
import { buildPositionDisplayGroups } from "@/lib/hr/position-grouping";

export type SortKey = "positionName" | "createdAt";
export type SortOrder = "asc" | "desc";

interface PositionClientProps {
  initialData: Position[];
  /** 서버에서 내려준 전체 직무 수(검색 필터 전) */
  listTotalCount: number;
}

export default function PositionClient({
  initialData,
  listTotalCount,
}: PositionClientProps) {
  // 💡 상태 관리
  const [positions, setPositions] = useState<Position[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  // 컴포넌트 내부 State 추가
  const [sortKey, setSortKey] = useState<SortKey>("positionName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  // 💡 모달 제어 상태
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );

  const router = useRouter();

  useEffect(() => {
    setPositions(initialData);
  }, [initialData]);

  const filteredPositions = useMemo(() => {
    if (!searchQuery.trim()) return positions;
    const keyword = searchQuery.toLowerCase();
    return positions.filter((pos) =>
      pos.positionName.toLowerCase().includes(keyword),
    );
  }, [positions, searchQuery]);

  const displayGroups = useMemo(
    () => buildPositionDisplayGroups(filteredPositions, sortKey, sortOrder),
    [filteredPositions, sortKey, sortOrder],
  );

  const filteredAndSortedPositions = useMemo(
    () => displayGroups.flatMap((group) => group.positions),
    [displayGroups],
  );

  // 🛠️ CRUD 핸들러 (실제로는 여기서 API 통신을 수행합니다)

  // 1. 생성 (Create) & 수정 (Update)
  // 🛠️ CRUD 핸들러 - 실제 API 연동
  const handleSavePosition = async (positionName: string) => {
    const DURATION = 1500; // 토스트 지속 시간 (2초)
    try {
      if (selectedPosition) {
        // 💡 1. 수정 (PATCH) 로직
        const response = await positionApi.updatePosition(
          selectedPosition.positionId,
          { positionName },
        );

        // 로컬 상태 즉각 업데이트 (Optimistic UI - 빠른 화면 전환을 위해)
        setPositions((prev) =>
          prev.map((pos) =>
            pos.positionId === selectedPosition.positionId
              ? { ...pos, positionName }
              : pos,
          ),
        );
        // 💡 성공 토스트 띄우기 (수정)
        toast.custom(
          (t) => (
            <ToastUI t={t} message={response.message} duration={DURATION} />
          ),
          { duration: DURATION },
        );
      } else {
        // 💡 2. 생성 (POST) 로직
        const response = await positionApi.createPosition({ positionName });
        // 1. 성공 토스트 띄우기 (생성)
        toast.custom(
          (t) => (
            <ToastUI t={t} message={response.message} duration={DURATION} />
          ),
          { duration: DURATION },
        );

        // 💡 2. 토스트 유지 시간(DURATION)만큼 기다렸다가 새로고침 실행
        setTimeout(() => {
          router.refresh();
        }, DURATION);
      }

      // 💡 3. 성공 시 모달 닫기 및 선택 초기화
      setIsFormModalOpen(false);
      setSelectedPosition(null);
    } catch (error: any) {
      console.error("직무 저장 실패:", error);
      // 💡 에러 발생 시 토스트 (에러는 기본 sonner 디자인을 쓰거나, ToastUI를 에러용으로 하나 더 만들어 쓰시면 좋습니다)
      const errorMessage =
        error.response?.data?.message ||
        "저장 중 오류가 발생했습니다. 다시 시도해주세요.";
      toast.error(errorMessage, { duration: 2000 });
    }
  };

  // 2. 삭제 (Delete)
  const handleDeletePosition = async () => {
    if (!selectedPosition) return;

    // API 통신 시뮬레이션
    // await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const response = await positionApi.deletePosition(
        selectedPosition.positionId,
      );
      setPositions((prev) =>
        prev.filter((pos) => pos.positionId !== selectedPosition.positionId),
      );
      // 💡 성공 토스트 띄우기 (삭제)
      toast.custom(
        (t) => <ToastUI t={t} message={response.message} duration={2000} />,
        { duration: 2000 },
      );
    } catch (error: any) {
      console.error("직무 삭제 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        "삭제 중 오류가 발생했습니다. 다시 시도해주세요.";
      toast.error(errorMessage, { duration: 2000 });
    } finally {
      // 서버에서 삭제된 최신 리스트를 다시 가져오기 위해 새로고침
      setIsDeleteModalOpen(false);
      setSelectedPosition(null);
    }
  };

  const visibleCount = filteredAndSortedPositions.length;
  const sortPreset = `${sortKey}:${sortOrder}` as
    | "positionName:asc"
    | "positionName:desc"
    | "createdAt:asc"
    | "createdAt:desc";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-[24px]">
      <div className="shrink-0 space-y-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-bold text-slate-500 sm:text-[13px]">
            <i className="bx bx-filter-alt text-indigo-500" />
            <span className="tabular-nums text-slate-700">총 {listTotalCount}개</span>
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span className="tabular-nums text-slate-600">표시 {visibleCount}개</span>
          </p>
          <p className="hidden items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 lg:flex">
            <i className="bx bx-category text-sm text-slate-300" />
            유사 직무 분류별 · 열 헤더로 정렬
          </p>
        </div>

        <div className="relative lg:hidden">
          <i className="bx bx-sort-alt-2 pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-slate-400" />
          <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            aria-label="목록 정렬"
            value={sortPreset}
            onChange={(e) => {
              const [key, order] = e.target.value.split(":") as [
                SortKey,
                SortOrder,
              ];
              setSortKey(key);
              setSortOrder(order);
            }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-[13px] font-bold text-slate-600 shadow-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="positionName:asc">분류별 · 직무명 가나다순</option>
            <option value="positionName:desc">분류별 · 직무명 역순</option>
            <option value="createdAt:desc">분류별 · 최신 등록순</option>
            <option value="createdAt:asc">분류별 · 오래된 등록순</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
          <div className="relative min-w-0 flex-1 xl:max-w-md">
            <i className="bx bx-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="search"
              placeholder="직무명 검색…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 ${searchQuery.trim() ? "pr-11" : "pr-4"}`}
            />
            {searchQuery.trim() ? (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <i className="bx bx-x text-xl" />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPosition(null);
              setIsFormModalOpen(true);
            }}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-black text-white shadow-md shadow-indigo-200/80 transition-all hover:bg-indigo-700 active:scale-[0.98] xl:self-center"
          >
            <i className="bx bx-plus-circle text-lg leading-none" />
            <span className="whitespace-nowrap">새 직무 추가</span>
          </button>
        </div>
      </div>

      {/* 테이블 영역 (스크롤 가능) */}
      <div className="flex-1 overflow-auto bg-white">
        <PositionTable
          groups={displayGroups}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={(key) => {
            // 같은 컬럼을 클릭하면 방향 반전, 다른 컬럼이면 해당 컬럼의 asc로 설정
            if (sortKey === key) {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortKey(key);
              setSortOrder("asc");
            }
          }}
          onEdit={(pos) => {
            setSelectedPosition(pos);
            setIsFormModalOpen(true);
          }}
          onDelete={(pos) => {
            setSelectedPosition(pos);
            setIsDeleteModalOpen(true);
          }}
        />
      </div>

      {/* 💡 모달 컴포넌트 마운트 */}
      <PositionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSavePosition}
        initialData={selectedPosition}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePosition}
        targetName={selectedPosition?.positionName || ""}
      />
    </div>
  );
}
