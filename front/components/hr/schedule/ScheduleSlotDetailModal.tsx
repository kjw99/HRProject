"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import type { Applicant } from "@/types/applicant";
import type { InterviewSlotDetailItem } from "@/types/interviewSlotWrite";
import type { Position } from "@/types/position";
import { interviewBookingApi } from "@/lib/hr/interview-bookings.client";
import { interviewerApi } from "@/lib/hr/interviewers.client";
import { interviewSlotsApi } from "@/lib/hr/interview-slots.client";
import type { HrInterviewer, InterviewRound } from "@/types/interviewer";

const ROUNDS: InterviewRound[] = ["1차", "2차", "3차"];

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    response?: { data?: { message?: string; detail?: string } };
  };
  return maybe.response?.data?.message || maybe.response?.data?.detail || fallback;
};

function inferPositionId(slot: InterviewSlotDetailItem, positions: Position[]): number | null {
  const matched = positions.find((p) => p.positionName === slot.positionName);
  return matched?.positionId ?? null;
}

function parseRound(round: string): InterviewRound | undefined {
  return ROUNDS.includes(round as InterviewRound) ? (round as InterviewRound) : undefined;
}

export interface ScheduleSlotDetailModalProps {
  isOpen: boolean;
  slot: InterviewSlotDetailItem | null;
  onClose: () => void;
  getStatusMeta: (status: string) => { label: string; className: string };
  positions: Position[];
  applicants: Applicant[];
  onSlotMutated: (slotId: number) => Promise<void>;
  /** 일정 수정(슬롯 편집 폼)으로 전환 — `PATCH /api/interview-slots/{id}`와 동일 흐름 */
  onEditSlot?: (slot: InterviewSlotDetailItem) => void;
}

export function ScheduleSlotDetailModal({
  isOpen,
  slot,
  onClose,
  getStatusMeta,
  positions,
  applicants,
  onSlotMutated,
  onEditSlot,
}: ScheduleSlotDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [interviewers, setInterviewers] = useState<HrInterviewer[]>([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  const [draftInterviewerIds, setDraftInterviewerIds] = useState<number[]>([]);
  const [savingInterviewers, setSavingInterviewers] = useState(false);
  const [bookingCandidateId, setBookingCandidateId] = useState<number | null>(null);

  const positionId = useMemo(
    () => (slot ? inferPositionId(slot, positions) : null),
    [slot, positions],
  );

  const round = useMemo(() => (slot ? parseRound(slot.interviewRound) : undefined), [slot]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !slot) return;
    if (positionId == null || !round) {
      setInterviewers([]);
      setDraftInterviewerIds([]);
      return;
    }
    let ignore = false;
    setLoadingInterviewers(true);
    interviewerApi
      .fetchInterviewers({
        positionId,
        interviewRound: round,
        size: 100,
      })
      .then((res) => {
        if (ignore) return;
        setInterviewers(res.content);
        const matchedIds = res.content
          .filter((i) => slot.interviewerNames.includes(i.interviewerName))
          .map((i) => i.interviewerId);
        setDraftInterviewerIds(matchedIds);
      })
      .catch((error) => {
        if (ignore) return;
        toast.error(getErrorMessage(error, "면접관 목록을 불러오지 못했습니다."));
        setInterviewers([]);
        setDraftInterviewerIds([]);
      })
      .finally(() => {
        if (!ignore) setLoadingInterviewers(false);
      });
    return () => {
      ignore = true;
    };
  }, [isOpen, slot, positionId, round]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const positionApplicants = useMemo(() => {
    if (positionId == null || !slot) return [];
    return applicants.filter((a) => a.position_id === positionId);
  }, [applicants, positionId, slot]);

  const toggleInterviewerDraft = (id: number) => {
    setDraftInterviewerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const saveInterviewers = async () => {
    if (!slot) return;
    setSavingInterviewers(true);
    try {
      await interviewSlotsApi.updateSlot(slot.slotId, {
        interviewerIds: draftInterviewerIds,
      });
      toast.success("면접관 배정이 저장되었습니다.");
      await onSlotMutated(slot.slotId);
    } catch (error) {
      toast.error(getErrorMessage(error, "면접관 저장에 실패했습니다."));
    } finally {
      setSavingInterviewers(false);
    }
  };

  const assignCandidateToSlot = async (candidateId: number) => {
    if (!slot) return;
    setBookingCandidateId(candidateId);
    try {
      await interviewBookingApi.createBooking({
        candidateId,
        slotId: slot.slotId,
      });
      toast.success("해당 지원자를 이 일정에 예약했습니다.");
      await onSlotMutated(slot.slotId);
    } catch (error) {
      toast.error(getErrorMessage(error, "예약 배정에 실패했습니다."));
    } finally {
      setBookingCandidateId(null);
    }
  };

  if (!mounted || !isOpen || !slot) return null;

  const status = getStatusMeta(slot.slotStatus);
  const start = parseISO(slot.interviewStartsAt);
  const end = parseISO(slot.interviewEndsAt);

  const isBookedName = (name: string) => slot.bookedCandidateNames.includes(name);

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
              정원 {slot.remainingCapacity + slot.bookedCandidateNames.length}명 · 잔여{" "}
              {slot.remainingCapacity}명
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
                현재 면접관
              </dt>
              <dd className="mt-1 font-bold text-slate-900">
                {slot.interviewerNames.length > 0
                  ? slot.interviewerNames.join(", ")
                  : "미배정"}
              </dd>
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
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                예약 지원자
              </dt>
              <dd className="mt-1 font-bold text-slate-900">
                {slot.bookedCandidateNames.length > 0
                  ? slot.bookedCandidateNames.join(", ")
                  : "없음"}
              </dd>
            </div>
          </dl>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-900">면접관 조회·배정</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              같은 직무·차수에 등록된 면접관입니다. 선택 후 저장하면 슬롯에 반영됩니다.
            </p>
            {positionId == null || !round ? (
              <p className="mt-3 text-xs font-bold text-amber-700">
                직무명이 공고 목록과 일치하지 않거나 차수가 올바르지 않아 API로 조회할 수
                없습니다.
              </p>
            ) : loadingInterviewers ? (
              <p className="mt-4 text-sm font-bold text-slate-500">불러오는 중…</p>
            ) : interviewers.length === 0 ? (
              <p className="mt-3 text-xs font-bold text-slate-500">
                조건에 맞는 면접관이 없습니다.
              </p>
            ) : (
              <>
                <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                  {interviewers.map((iv) => {
                    const on = draftInterviewerIds.includes(iv.interviewerId);
                    return (
                      <li key={iv.interviewerId}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 transition hover:bg-slate-100">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleInterviewerDraft(iv.interviewerId)}
                            className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                          />
                          <span className="min-w-0 flex-1 text-sm font-bold text-slate-900">
                            {iv.interviewerName}
                            <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-500">
                              {iv.interviewerEmail}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  disabled={savingInterviewers}
                  onClick={() => void saveInterviewers()}
                  className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingInterviewers ? "저장 중…" : "면접관 저장"}
                </button>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-900">같은 직무 지원자 예약 배정</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              이 공고에 지원한 지원자 중 아직 이 슬롯에 예약되지 않은 사람만 배정할 수
              있습니다.
            </p>
            {positionId == null ? (
              <p className="mt-3 text-xs font-bold text-amber-700">
                직무를 식별할 수 없어 지원자 목록을 필터링하지 못했습니다.
              </p>
            ) : positionApplicants.length === 0 ? (
              <p className="mt-3 text-xs font-bold text-slate-500">해당 직무 지원자가 없습니다.</p>
            ) : (
              <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                {positionApplicants.map((a) => {
                  const booked = isBookedName(a.name);
                  const disabled =
                    booked || slot.remainingCapacity <= 0 || bookingCandidateId !== null;
                  return (
                    <li
                      key={a.candidate_id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">{a.name}</p>
                        <p className="truncate text-[11px] font-semibold text-slate-500">
                          {a.application_status} · {a.experience_level}
                          {booked ? " · 이미 예약됨" : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => void assignCandidateToSlot(a.candidate_id)}
                        className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-indigo-700 disabled:opacity-40"
                      >
                        {bookingCandidateId === a.candidate_id
                          ? "처리 중…"
                          : booked
                            ? "예약됨"
                            : "이 슬롯에 배정"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
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
