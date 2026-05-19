"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteApplicant,
  fetchApplicantDetail,
  updateApplicant,
} from "@/lib/hr/interview.client";
import { interviewBookingInvitationApi } from "@/lib/hr/interview-booking-invitations.client";
import { interviewBookingApi } from "@/lib/hr/interview-bookings.client";
import type {
  Applicant,
  ApplicantDetail,
  ApplicantUpdatePayload,
} from "@/types/applicant";
import HrInfoSection from "@/components/hr/shared/HrInfoSection";
import { BookingInviteStatusBadge } from "@/components/hr/shared/HrStatusBadge";
import { resolveBookingInviteStatus } from "@/lib/hr/invitation-status";
import ApplicantDeleteConfirmModal from "./ApplicantDeleteConfirmModal";
import ApplicantDetailActionBar from "./ApplicantDetailActionBar";
import ApplicantEditModal from "./ApplicantEditModal";
import ApplicantEmailValue from "./ApplicantEmailValue";

interface ApplicantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
  onApplicantUpdated?: (applicant: Applicant) => void;
  onApplicantDeleted?: (candidateId: number) => void;
  /**
   * 수정/삭제 같은 mutation 성공 직후 호출됨.
   * 부모(리스트)에서 서버 데이터를 다시 불러와 정합성을 맞추는 용도.
   * - local state 패치(onApplicantUpdated/Deleted)는 즉시 반영용,
   *   이 콜백은 서버 truth 와 sync 하기 위한 백그라운드 트리거.
   */
  onListRefreshRequested?: () => void;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    response?: { data?: { message?: string; detail?: string } };
    message?: string;
  };

  return (
    maybe.response?.data?.message ||
    maybe.response?.data?.detail ||
    maybe.message ||
    fallback
  );
};

export default function ApplicantDetailModal({
  isOpen,
  onClose,
  applicant,
  onApplicantUpdated,
  onApplicantDeleted,
  onListRefreshRequested,
}: ApplicantDetailModalProps) {
  const [detail, setDetail] = useState<ApplicantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [revokingInvitationId, setRevokingInvitationId] = useState<number | null>(
    null,
  );
  const [isCancellingBooking, setIsCancellingBooking] = useState(false);

  useEffect(() => {
    if (!isOpen || !applicant) return;

    let cancelled = false;

    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const data = await fetchApplicantDetail(applicant.candidate_id);
        if (!cancelled) {
          setDetail(data);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            getErrorMessage(error, "지원자 상세 정보를 불러오지 못했습니다."),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [applicant, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setDetail(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !applicant) return null;

  const profile = detail ?? applicant;

  const handleSaveApplicant = async (payload: ApplicantUpdatePayload) => {
    try {
      const updated = await updateApplicant(applicant.candidate_id, payload);

      /**
       * PATCH 응답을 1차 반영하여 즉시 UI에 변경사항을 표시.
       * - 그 후 detail을 다시 불러와 join 필드(position_name 등)와
       *   파생 데이터(current_booking, booking_invitations)까지 최신화한다.
       */
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
            }
          : null,
      );
      onApplicantUpdated?.(updated);
      setIsEditModalOpen(false);
      toast.success("지원자 정보가 수정되었습니다.");

      // 부모 리스트를 서버 truth 와 sync (background, 화면 깜빡임 없음)
      onListRefreshRequested?.();

      try {
        const fresh = await fetchApplicantDetail(applicant.candidate_id);
        setDetail(fresh);
        onApplicantUpdated?.(fresh);
      } catch {
        /* 새로고침 실패는 사용자 흐름을 막지 않는다 (이미 1차 반영 완료) */
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "지원자 정보 수정 중 오류가 발생했습니다."));
    }
  };

  const handleDeleteApplicant = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteApplicant(applicant.candidate_id);
      onApplicantDeleted?.(applicant.candidate_id);
      toast.success(response.message);
      setIsDeleteModalOpen(false);
      onClose();

      // 삭제는 다른 row 들(중복 표시/통계)에도 영향을 주므로 리스트 전체를 sync
      onListRefreshRequested?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "지원자 삭제 중 오류가 발생했습니다."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: number) => {
    setRevokingInvitationId(invitationId);
    try {
      const response = await interviewBookingInvitationApi.revokeInvitation(
        invitationId,
      );
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              booking_invitations: prev.booking_invitations.map((item) =>
                item.invitation_id === invitationId
                  ? {
                      ...item,
                      revoked_at: new Date().toISOString(),
                    }
                  : item,
              ),
            }
          : prev,
      );
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "초대 링크 회수에 실패했습니다."));
    } finally {
      setRevokingInvitationId(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!detail?.current_booking) return;

    setIsCancellingBooking(true);
    try {
      const response = await interviewBookingApi.cancelBooking(
        detail.current_booking.booking_id,
        {
          candidateId: applicant.candidate_id,
        },
      );
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              current_booking: null,
            }
          : prev,
      );
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "면접 예약 취소에 실패했습니다."));
    } finally {
      setIsCancellingBooking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-115 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-500">
              Candidate Detail
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              지원자 상세 정보
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {profile.name} · 후보자 #{profile.candidate_id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-white hover:text-slate-600"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="space-y-4 overflow-y-auto border-b border-slate-100 bg-slate-50/30 p-4 sm:p-6 lg:max-h-[min(70vh,640px)] lg:border-b-0 lg:border-r">
            <ApplicantDetailActionBar
              onEdit={() => setIsEditModalOpen(true)}
              onDelete={() => setIsDeleteModalOpen(true)}
              onClose={onClose}
            />

            <HrInfoSection
              title="기본 정보"
              eyebrow="Profile"
              eyebrowIcon="user"
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  지원 포지션
                </p>
                <p className="mt-2 text-base font-black text-slate-900">
                  {detail?.position_name || `공고 #${profile.position_id}`}
                </p>
              </div>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  이메일
                </p>
                <ApplicantEmailValue email={profile.email} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  연락처
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {profile.phone || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  경력 구분
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {profile.experience_level}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  최종 상태
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {profile.application_status} / {profile.final_status}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  생년월일
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {profile.date_of_birth || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  성별
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {profile.gender || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  주소
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                  {profile.address || "-"}
                </p>
              </div>

              </div>
            </HrInfoSection>

            <HrInfoSection
              title="우대 조건"
              eyebrow="Criteria"
              eyebrowIcon="certification"
            >
              <div className="flex flex-wrap gap-2">
                  {profile.meets_preferred_criteria?.length ? (
                    profile.meets_preferred_criteria.map((criteria) => (
                      <span
                        key={criteria}
                        className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700"
                      >
                        {criteria}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">
                      충족한 우대 조건이 없습니다.
                    </span>
                  )}
              </div>
            </HrInfoSection>

            <HrInfoSection
              title="예약 상태"
              eyebrow="Booking"
              eyebrowIcon="calendar-check"
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      현재 예약 상태
                    </p>
                    <p className="mt-2 text-base font-black text-slate-900">
                      {detail?.current_booking
                        ? detail.current_booking.cancelled_at
                          ? "취소된 예약"
                          : "예약 있음"
                        : "예약 없음"}
                    </p>
                  </div>
                  {detail?.current_booking && !detail.current_booking.cancelled_at ? (
                    <button
                      type="button"
                      onClick={() => void handleCancelBooking()}
                      disabled={isCancellingBooking}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      <i
                        className={`bx ${
                          isCancellingBooking
                            ? "bx-loader-alt animate-spin"
                            : "bx-calendar-x"
                        } text-base`}
                      />
                      예약 취소
                    </button>
                  ) : null}
                </div>

                {detail?.current_booking ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        예약 ID
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        #{detail.current_booking.booking_id}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        면접 차수
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {detail.current_booking.interview_round || "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        시작 시각
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDateTime(detail.current_booking.interview_starts_at)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        면접 장소
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {detail.current_booking.interview_location || "미정"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-semibold text-slate-400">
                    아직 확정된 면접 예약이 없습니다.
                  </p>
                )}
            </HrInfoSection>
          </section>

          <section className="flex min-h-0 flex-col bg-slate-50/50">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-500">
                Mail History
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-900">
                초대 메일 발송 이력
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                초대 링크 생성 기록 기준으로 최근 순으로 보여줍니다.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
                  상세 정보를 불러오는 중입니다...
                </div>
              ) : detail?.booking_invitations?.length ? (
                <ul className="space-y-3">
                  {detail.booking_invitations.map((item) => (
                    <li
                      key={item.invitation_id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            초대 #{item.invitation_id}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            발송 시각 {formatDateTime(item.created_at)}
                          </p>
                        </div>
                        <BookingInviteStatusBadge
                          status={resolveBookingInviteStatus(item)}
                        />
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            만료 시각
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {formatDateTime(item.expires_at)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            허용 슬롯 수
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {item.slot_ids.length}개
                          </p>
                        </div>
                      </div>

                      {resolveBookingInviteStatus(item) === "active" ? (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void handleRevokeInvitation(item.invitation_id)}
                            disabled={revokingInvitationId === item.invitation_id}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                          >
                            <i
                              className={`bx ${
                                revokingInvitationId === item.invitation_id
                                  ? "bx-loader-alt animate-spin"
                                  : "bx-block"
                              } text-base`}
                            />
                            초대 회수
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
                  아직 초대 메일 발송 이력이 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <ApplicantEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        applicant={profile}
        onSave={handleSaveApplicant}
      />

      <ApplicantDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteModalOpen(false);
        }}
        applicant={profile}
        onConfirm={handleDeleteApplicant}
        isDeleting={isDeleting}
      />
    </div>
  );
}
