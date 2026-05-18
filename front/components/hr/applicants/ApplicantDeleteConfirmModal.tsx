"use client";

import HrModal from "@/components/hr/shared/HrModal";
import type { Applicant } from "@/types/applicant";

interface ApplicantDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export default function ApplicantDeleteConfirmModal({
  isOpen,
  onClose,
  applicant,
  onConfirm,
  isDeleting,
}: ApplicantDeleteConfirmModalProps) {
  return (
    <HrModal
      isOpen={isOpen}
      onClose={() => !isDeleting && onClose()}
      title="지원자 삭제"
      subtitle={
        applicant
          ? `${applicant.name} · 후보자 #${applicant.candidate_id}`
          : "선택된 지원자를 삭제합니다."
      }
      eyebrow="Danger Zone"
      eyebrowIcon="trash"
      theme="amber"
      size="md"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isDeleting || !applicant}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            <i
              className={`bx ${
                isDeleting ? "bx-loader-alt animate-spin" : "bx-trash"
              } text-lg`}
            />
            삭제하기
          </button>
        </div>
      }
    >
      <div className="space-y-4 p-5 sm:p-6">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
          <p className="text-sm font-black text-rose-700">
            삭제한 지원자 데이터는 복구하기 어렵습니다.
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-rose-600">
            상세 정보, 우대 조건 기록, 연동된 운영 흐름에 영향이 있을 수 있으니
            정말 삭제가 필요한 경우에만 진행하세요.
          </p>
        </div>

        <dl className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-black uppercase tracking-wider text-slate-400">
              이름
            </dt>
            <dd className="text-sm font-bold text-slate-800">
              {applicant?.name ?? "-"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-black uppercase tracking-wider text-slate-400">
              이메일
            </dt>
            <dd className="text-sm font-semibold text-slate-600">
              {applicant?.email ?? "미등록"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs font-black uppercase tracking-wider text-slate-400">
              포지션 ID
            </dt>
            <dd className="text-sm font-semibold text-slate-600">
              {applicant?.position_id ?? "-"}
            </dd>
          </div>
        </dl>
      </div>
    </HrModal>
  );
}
