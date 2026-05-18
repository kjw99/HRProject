"use client";

import { useEffect, useMemo, useState } from "react";
import HrModal from "@/components/hr/shared/HrModal";
import type { Applicant, ApplicantUpdatePayload } from "@/types/applicant";

interface ApplicantEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
  onSave: (payload: ApplicantUpdatePayload) => Promise<void>;
}

type ApplicantFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: string;
  experience_level: Applicant["experience_level"];
  application_status: Applicant["application_status"];
  final_status: Applicant["final_status"];
  meets_preferred_criteria_text: string;
};

const createInitialState = (applicant: Applicant | null): ApplicantFormState => ({
  name: applicant?.name ?? "",
  email: applicant?.email ?? "",
  phone: applicant?.phone ?? "",
  address: applicant?.address ?? "",
  date_of_birth: applicant?.date_of_birth ?? "",
  gender: applicant?.gender ?? "",
  experience_level: applicant?.experience_level ?? "무관",
  application_status: applicant?.application_status ?? "서류",
  final_status: applicant?.final_status ?? "진행중",
  meets_preferred_criteria_text:
    applicant?.meets_preferred_criteria?.join(", ") ?? "",
});

export default function ApplicantEditModal({
  isOpen,
  onClose,
  applicant,
  onSave,
}: ApplicantEditModalProps) {
  const [form, setForm] = useState<ApplicantFormState>(createInitialState(applicant));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(createInitialState(applicant));
  }, [applicant, isOpen]);

  const criteriaPreview = useMemo(
    () =>
      form.meets_preferred_criteria_text
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.meets_preferred_criteria_text],
  );

  if (!applicant) return null;

  const updateField = <K extends keyof ApplicantFormState>(
    key: K,
    value: ApplicantFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        address: form.address.trim(),
        date_of_birth: form.date_of_birth.trim(),
        gender: form.gender.trim() || null,
        experience_level: form.experience_level,
        application_status: form.application_status,
        final_status: form.final_status,
        meets_preferred_criteria: criteriaPreview,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HrModal
      isOpen={isOpen}
      onClose={() => !isSaving && onClose()}
      title="지원자 정보 수정"
      subtitle={`${applicant.name} · 후보자 #${applicant.candidate_id}`}
      eyebrow="Applicant Edit"
      eyebrowIcon="edit"
      theme="emerald"
      size="lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving || !form.name.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <i
              className={`bx ${
                isSaving ? "bx-loader-alt animate-spin" : "bx-save"
              } text-lg`}
            />
            저장하기
          </button>
        </div>
      }
    >
      <div className="grid gap-5 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-slate-600">
            지원자 이름
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            이메일
            <input
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            연락처
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            생년월일
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(event) =>
                updateField("date_of_birth", event.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            성별
            <input
              value={form.gender}
              onChange={(event) => updateField("gender", event.target.value)}
              placeholder="남 / 여"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            경력 구분
            <select
              value={form.experience_level}
              onChange={(event) =>
                updateField(
                  "experience_level",
                  event.target.value as Applicant["experience_level"],
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="신입">신입</option>
              <option value="경력">경력</option>
              <option value="무관">무관</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            지원 단계
            <select
              value={form.application_status}
              onChange={(event) =>
                updateField(
                  "application_status",
                  event.target.value as Applicant["application_status"],
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="서류">서류</option>
              <option value="면접">면접</option>
              <option value="최종합격">최종합격</option>
              <option value="불합격">불합격</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            최종 상태
            <select
              value={form.final_status}
              onChange={(event) =>
                updateField(
                  "final_status",
                  event.target.value as Applicant["final_status"],
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="진행중">진행중</option>
              <option value="합격">합격</option>
              <option value="불합격">불합격</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-black text-slate-600">
          주소
          <textarea
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            rows={3}
            className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="grid gap-2 text-sm font-black text-slate-600">
          우대 조건 충족
          <textarea
            value={form.meets_preferred_criteria_text}
            onChange={(event) =>
              updateField("meets_preferred_criteria_text", event.target.value)
            }
            rows={4}
            placeholder="쉼표(,)로 구분해 입력하세요."
            className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="flex flex-wrap gap-2">
            {criteriaPreview.length > 0 ? (
              criteriaPreview.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-xs font-semibold text-slate-400">
                아직 입력된 우대 조건이 없습니다.
              </span>
            )}
          </div>
        </label>
      </div>
    </HrModal>
  );
}
