"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import type { InterviewSlotDetailItem } from "@/types/interviewSlotWrite";
import { interviewBookingApi } from "@/lib/hr/interview-bookings.client";

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    response?: { data?: { message?: string; detail?: string } };
  };
  return (
    maybe.response?.data?.message || maybe.response?.data?.detail || fallback
  );
};

export interface ScheduleSlotDetailModalProps {
  isOpen: boolean;
  slot: InterviewSlotDetailItem | null;
  onClose: () => void;
  getStatusMeta: (status: string) => { label: string; className: string };
  onSlotMutated: (slotId: number) => Promise<void>;
  /** 일정 수정(슬롯 편집 폼)으로 전환 — `PATCH /api/interview-slots/{id}`와 동일 흐름 */
  onEditSlot?: (slot: InterviewSlotDetailItem) => void;
  /**
   * "지원자에게 시간 선택 초대 보내기" CTA 클릭 콜백.
   * 부모(ScheduleClient)에서 `ScheduleOperationsModal`을 여는 핸들러를 전달하세요.
   */
  onOpenInvitation?: () => void;
}

export function ScheduleSlotDetailModal({
  isOpen,
  slot,
  onClose,
  getStatusMeta,
  onSlotMutated,
  onEditSlot,
  onOpenInvitation,
}: ScheduleSlotDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null,
  );
  const [pendingCancelBookingId, setPendingCancelBookingId] = useState<
    number | null
  >(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const bookedCandidates = slot?.bookedCandidates ?? [];

  const isStartedSlot = useMemo(() => {
    if (!slot) return false;
    return new Date(slot.interviewStartsAt).getTime() <= Date.now();
  }, [slot]);

  const cancelCandidateBooking = async (
    bookingId: number,
    candidateId: number,
  ) => {
    if (!slot) return;
    setCancellingBookingId(bookingId);
    try {
      await interviewBookingApi.cancelBooking(bookingId, { candidateId });
      toast.success("면접 예약이 취소되었습니다.");
      await onSlotMutated(slot.slotId);
    } catch (error) {
      toast.error(getErrorMessage(error, "면접 예약 취소에 실패했습니다."));
    } finally {
      setCancellingBookingId(null);
      setPendingCancelBookingId(null);
    }
  };

  if (!mounted || !isOpen || !slot) return null;

  const status = getStatusMeta(slot.slotStatus);
  const start = parseISO(slot.interviewStartsAt);
  const end = parseISO(slot.interviewEndsAt);
  const totalCapacity =
    slot.remainingCapacity + slot.bookedCandidateNames.length;

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[min(90vh,720px)] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              면접 일정 상세
            </p>
            <h2
              id="slot-detail-title"
              className="mt-1 truncate text-lg font-black text-slate-900"
            >
              {slot.positionName ?? "직무 미지정"} · {slot.interviewRound}
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {format(start, "yyyy년 M월 d일 (EEE)", { locale: ko })}{" "}
              {format(start, "HH:mm")} – {format(end, "HH:mm")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onEditSlot ? (
              <button
                type="button"
                onClick={() => onEditSlot(slot)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-800 transition hover:bg-indigo-100"
              >
                <i className="bx bx-edit text-base" aria-hidden />
                일정 수정
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="닫기"
            >
              <i className="bx bx-x text-xl" />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar max-h-[min(58vh,520px)] space-y-5 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${status.className}`}
            >
              {status.label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              정원 {totalCapacity}명 · 잔여 {slot.remainingCapacity}명
            </span>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                면접 장소
              </dt>
              <dd className="mt-1 font-bold text-slate-900">
                {slot.interviewLocation?.trim() || "미정"}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                배정된 면접관
              </dt>
              <dd className="mt-1 font-bold text-slate-900">
                {slot.interviewerNames.length > 0
                  ? slot.interviewerNames.join(", ")
                  : "미배정"}
              </dd>
              <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                면접관 변경은 상단의 <b>[일정 수정]</b>에서 진행하세요.
              </p>
            </div>
            {slot.bookingDeadlineAt ? (
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  예약 마감
                </dt>
                <dd className="mt-1 font-bold text-slate-900">
                  {format(parseISO(slot.bookingDeadlineAt), "yyyy.M.d HH:mm", {
                    locale: ko,
                  })}
                </dd>
              </div>
            ) : null}
          </dl>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-900">
                예약된 지원자 ({bookedCandidates.length}명)
              </h3>
              {isStartedSlot ? (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black tracking-widest text-slate-500">
                  종료/진행 슬롯 · 취소 불가
                </span>
              ) : null}
            </div>
            {bookedCandidates.length === 0 ? (
              slot.bookedCandidateNames.length > 0 ? (
                <p className="mt-3 text-xs font-bold text-amber-700">
                  <i className="bx bx-error-circle mr-1" />
                  {slot.bookedCandidateNames.join(", ")} 의 예약 식별 정보가
                  누락되어 취소 버튼을 표시할 수 없습니다. 서버를 재시작했거나
                  데이터가 동기화되지 않은 상태일 수 있어요.
                </p>
              ) : (
                <p className="mt-3 text-xs font-bold text-slate-500">
                  아직 예약된 지원자가 없습니다. 지원자가 초대 링크에서 가능
                  시간을 선택하면 자동으로 이 칸이 채워집니다.
                </p>
              )
            ) : (
              <ul className="mt-3 space-y-2">
                {bookedCandidates.map((booking) => {
                  const isCancelling = cancellingBookingId === booking.bookingId;
                  const isPending = pendingCancelBookingId === booking.bookingId;
                  const disableAll =
                    cancellingBookingId !== null && !isCancelling;
                  return (
                    <li
                      key={booking.bookingId}
                      className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          <i className="bx bx-user-check mr-1 text-emerald-600" />
                          {booking.candidateName}
                          <span className="ml-1.5 text-[10px] font-bold text-slate-400">
                            #{booking.candidateId}
                          </span>
                        </p>
                        <p className="truncate text-[11px] font-semibold text-slate-500">
                          예약 ID {booking.bookingId}
                          {booking.bookedAt
                            ? ` · ${format(parseISO(booking.bookedAt), "M.d HH:mm", { locale: ko })} 확정`
                            : ""}
                        </p>
                      </div>

                      {isPending ? (
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-[11px] font-black text-rose-600">
                            정말 취소할까요?
                          </span>
                          <button
                            type="button"
                            disabled={isCancelling || disableAll}
                            onClick={() =>
                              void cancelCandidateBooking(
                                booking.bookingId,
                                booking.candidateId,
                              )
                            }
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-rose-700 disabled:opacity-50"
                          >
                            {isCancelling ? (
                              <span className="inline-flex items-center gap-1">
                                <i className="bx bx-loader-alt animate-spin" />
                                취소 중
                              </span>
                            ) : (
                              "예 취소"
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isCancelling}
                            onClick={() => setPendingCancelBookingId(null)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                          >
                            아니오
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isStartedSlot || disableAll}
                          onClick={() =>
                            setPendingCancelBookingId(booking.bookingId)
                          }
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-black text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                          title={
                            isStartedSlot
                              ? "이미 시작된 면접 예약은 취소할 수 없습니다."
                              : "이 지원자의 예약을 취소합니다."
                          }
                        >
                          <i className="bx bx-x-circle text-base" />
                          예약 취소
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <i className="bx bx-paper-plane text-lg" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-indigo-900">
                  지원자 자동 배정 흐름 안내
                </h3>
                <ol className="mt-2 space-y-1 text-[12px] font-semibold leading-relaxed text-indigo-900/80">
                  <li>
                    <b>①</b> 여러 시간대의 면접 슬롯을 미리 생성합니다.
                  </li>
                  <li>
                    <b>②</b> 지원자에게 초대 링크를 보내고 가능한 시간을 선택하게
                    합니다.
                  </li>
                  <li>
                    <b>③</b> 지원자가 선택한 슬롯으로 <b>자동 예약</b>됩니다.
                  </li>
                </ol>
                {onOpenInvitation ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInvitation();
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <i className="bx bx-paper-plane text-base" />
                    지원자에게 초대 보내기
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
