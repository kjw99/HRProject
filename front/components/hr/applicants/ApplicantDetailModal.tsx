"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchApplicantDetail } from "@/lib/hr/interview.client";
import type { Applicant, ApplicantDetail } from "@/types/applicant";

interface ApplicantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
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
}: ApplicantDetailModalProps) {
  const [detail, setDetail] = useState<ApplicantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div
      className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
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
          <section className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  지원 포지션
                </p>
                <p className="mt-2 text-base font-black text-slate-900">
                  {detail?.position_name || `공고 #${profile.position_id}`}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  이메일
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {profile.email || "미등록"}
                </p>
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

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  우대 조건 충족
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
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
              </div>
            </div>
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
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                            item.revoked_at
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.revoked_at ? "만료/회수" : "유효"}
                        </span>
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
    </div>
  );
}
