"use client";

import HrModal from "@/components/hr/shared/HrModal";
import type { Applicant } from "@/types/applicant";

interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
}

export default function CriteriaModal({
  isOpen,
  onClose,
  applicant,
}: CriteriaModalProps) {
  if (!applicant) return null;

  const criteria = applicant.meets_preferred_criteria ?? [];

  return (
    <HrModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      theme="emerald"
      eyebrow="Preferred Criteria"
      eyebrowIcon="award"
      title="우대조건 충족 내역"
      subtitle={`${applicant.name} 지원자`}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          확인
        </button>
      }
    >
      <ul className="space-y-3 p-5 sm:p-6">
        {criteria.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4"
          >
            <i className="bx bxs-check-circle mt-0.5 text-lg text-emerald-500" />
            <span className="text-sm font-bold leading-snug text-slate-700">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </HrModal>
  );
}
