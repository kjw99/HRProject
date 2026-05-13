"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Applicant } from "@/types/applicant";
import { AvailableInterviewSlot } from "@/types/interviewBooking";
import { interviewBookingApi } from "@/lib/hr/interview-bookings.client";

interface ScheduleBookingModalProps {
  isOpen: boolean;
  applicants: Applicant[];
  onClose: () => void;
}

type ApiError = {
  response?: {
    data?: { detail?: string; message?: string };
  };
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;
  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.detail ||
    fallback
  );
};

const formatDateTime = (isoString: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));

export default function ScheduleBookingModal({
  isOpen,
  applicants,
  onClose,
}: ScheduleBookingModalProps) {
  const [candidateQuery, setCandidateQuery] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
    null,
  );
  const [availableSlots, setAvailableSlots] = useState<
    AvailableInterviewSlot[]
  >([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (!isOpen) return;
    setCandidateQuery("");
    setSelectedCandidateId(null);
    setAvailableSlots([]);
    setSelectedSlotId(null);
    setIsLoadingSlots(false);
    setIsSubmitting(false);
    setErrorMessage("");
  }, [isOpen]);

  // 지원자 선택 시 슬롯 패칭
  useEffect(() => {
    if (!selectedCandidateId) {
      setAvailableSlots([]);
      setSelectedSlotId(null);
      return;
    }

    let ignore = false;
    setIsLoadingSlots(true);
    setErrorMessage("");

    interviewBookingApi
      .fetchAvailableSlots(selectedCandidateId)
      .then((slots) => {
        if (ignore) return;
        setAvailableSlots(slots);
        // 슬롯이 1개면 자동 선택, 아니면 null
        setSelectedSlotId(slots.length === 1 ? slots[0].slotId : null);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setAvailableSlots([]);
        setSelectedSlotId(null);
        setErrorMessage(
          getApiErrorMessage(
            error,
            "예약 가능한 면접 슬롯을 불러오지 못했습니다.",
          ),
        );
      })
      .finally(() => {
        if (!ignore) setIsLoadingSlots(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedCandidateId]);

  const filteredApplicants = useMemo(() => {
    const query = candidateQuery.trim().toLowerCase();
    const source = applicants.slice(0, 80);
    if (!query) return source;
    return source.filter((applicant) =>
      [
        applicant.name,
        applicant.email ?? "",
        applicant.phone,
        String(applicant.candidate_id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [applicants, candidateQuery]);

  const selectedApplicant = useMemo(
    () =>
      applicants.find((a) => a.candidate_id === selectedCandidateId) ?? null,
    [applicants, selectedCandidateId],
  );

  const selectedSlot = useMemo(
    () => availableSlots.find((s) => s.slotId === selectedSlotId) ?? null,
    [availableSlots, selectedSlotId],
  );

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedCandidateId || !selectedSlotId || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await interviewBookingApi.createBooking({
        candidateId: selectedCandidateId,
        slotId: selectedSlotId,
      });
      toast.success("면접 일정이 성공적으로 연결되었습니다.", {
        duration: 3000,
      });
      onClose();
    } catch (error: unknown) {
      setErrorMessage(
        getApiErrorMessage(error, "일정 생성 중 오류가 발생했습니다."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
      {/* 화면의 최대 높이(90vh)를 지정하여 내부 스크롤이 생기도록 설계 */}
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* 1. 모달 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-8 py-5">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-black text-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <i className="bx bx-calendar-event text-xl" />
              </div>
              면접 일정 배정
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              지원자와 면접 슬롯을 선택하여 일정을 확정합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 active:scale-95"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </div>

        {/* 2. 본문 영역 (2-Column Grid) */}
        <div className="flex flex-1 overflow-hidden grid-cols-1 lg:grid lg:grid-cols-[400px_1fr] lg:divide-x divide-slate-100">
          {/* 왼쪽: 지원자 선택 패널 */}
          <div className="flex flex-col bg-white p-6 lg:p-8">
            <h3 className="mb-4 flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600">
                1
              </span>
              지원자 선택
            </h3>

            <div className="relative mb-4 shrink-0">
              <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
              <input
                value={candidateQuery}
                onChange={(e) => setCandidateQuery(e.target.value)}
                placeholder="이름, 이메일 검색..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {filteredApplicants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm font-bold text-slate-400">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredApplicants.map((applicant) => (
                  <div
                    key={applicant.candidate_id}
                    onClick={() =>
                      setSelectedCandidateId(applicant.candidate_id)
                    }
                    className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      selectedCandidateId === applicant.candidate_id
                        ? "border-indigo-300 bg-indigo-50/50 ring-1 ring-indigo-300"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black ${
                          selectedCandidateId === applicant.candidate_id
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        }`}
                      >
                        {applicant.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-800">
                          {applicant.name}
                        </p>
                        <p className="truncate text-xs font-bold text-slate-500">
                          {applicant.email ?? "이메일 없음"}
                        </p>
                      </div>
                    </div>
                    {selectedCandidateId === applicant.candidate_id && (
                      <i className="bx bxs-check-circle shrink-0 text-xl text-indigo-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 오른쪽: 슬롯 선택 및 확정 패널 */}
          <div className="flex flex-col bg-slate-50/30 p-6 lg:p-8">
            <h3 className="mb-4 flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600">
                2
              </span>
              면접 슬롯 배정
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {!selectedCandidateId ? (
                <div className="flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white py-20 text-slate-400">
                  <i className="bx bx-user-pin text-5xl mb-3 opacity-50" />
                  <p className="text-sm font-bold">
                    왼쪽 목록에서 지원자를 먼저 선택해주세요.
                  </p>
                </div>
              ) : isLoadingSlots ? (
                <div className="flex h-full flex-col items-center justify-center rounded-[20px] bg-white py-20 text-indigo-500 shadow-sm border border-slate-100">
                  <i className="bx bx-loader-alt bx-spin text-4xl mb-3" />
                  <p className="text-sm font-bold">
                    배정 가능한 슬롯을 조회 중입니다...
                  </p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-[20px] bg-white py-20 text-slate-400 shadow-sm border border-slate-100">
                  <i className="bx bx-calendar-x text-5xl mb-3 opacity-50" />
                  <p className="text-sm font-bold text-slate-500">
                    해당 지원자에게 배정 가능한 슬롯이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.slotId}
                      onClick={() => setSelectedSlotId(slot.slotId)}
                      className={`cursor-pointer rounded-xl border p-5 transition-all ${
                        selectedSlotId === slot.slotId
                          ? "border-indigo-400 bg-indigo-50/30 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]"
                          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">
                          {slot.interviewRound}
                        </span>
                        {selectedSlotId === slot.slotId && (
                          <i className="bx bxs-check-circle text-xl text-indigo-600" />
                        )}
                      </div>
                      <p className="text-[14px] font-black text-slate-800 mb-1">
                        {formatDateTime(slot.interviewStartsAt)}
                      </p>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <i className="bx bx-map text-sm" />{" "}
                        {slot.interviewLocation || "장소 미정"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 에러 메시지 */}
            {errorMessage && (
              <div className="mt-4 shrink-0 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-600 border border-rose-100">
                <i className="bx bx-error-circle text-lg" /> {errorMessage}
              </div>
            )}

            {/* 배정 요약 박스 (둘 다 선택 시 표시) */}
            {selectedApplicant && selectedSlot && (
              <div className="mt-6 shrink-0 rounded-[20px] bg-slate-800 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700">
                    <i className="bx bx-check-double text-2xl text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-300">
                      최종 확인
                    </p>
                    <p className="truncate text-base font-black">
                      <span className="text-indigo-300">
                        {selectedApplicant.name}
                      </span>
                      님에게
                      <span className="text-indigo-300 ml-1">
                        {formatDateTime(selectedSlot.interviewStartsAt)}
                      </span>{" "}
                      슬롯을 배정합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. 푸터 버튼 영역 */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-8 py-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
          >
            취소
          </button>

          <button
            onClick={handleSubmit}
            disabled={!selectedCandidateId || !selectedSlotId || isSubmitting}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-black text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? (
              <i className="bx bx-loader-alt bx-spin text-lg" />
            ) : (
              <i className="bx bx-calendar-check text-lg" />
            )}
            {isSubmitting ? "배정 중..." : "일정 확정"}
          </button>
        </div>
      </div>
    </div>
  );
}
