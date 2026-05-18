"use client";

import HrModal from "@/components/hr/shared/HrModal";
import type { TableRowData } from "@/types/parsing";

export interface ResumeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TableRowData | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ResumeDetailModal({
  isOpen,
  onClose,
  data,
  onEdit,
  onDelete,
}: ResumeDetailModalProps) {
  if (!data) {
    return null;
  }

  const { raw } = data;
  const aiProfile = raw.record.aiProfile;
  const candidate = raw.record.candidate;
  const match = raw.record.positionMatch;
  const isMatched = match.status === "matched";

  const skillChips = [
    ...(aiProfile.skills.programming_languages ?? []),
    ...(aiProfile.skills.frameworks ?? []),
    ...(aiProfile.skills.databases ?? []),
    ...(aiProfile.skills.tools ?? []),
    ...(aiProfile.skills.other ?? []),
  ];

  return (
    <HrModal
      isOpen={isOpen}
      onClose={onClose}
      title={data.name}
      subtitle={raw.filename}
      eyebrow="이력서 AI 분석"
      eyebrowIcon="user"
      theme="indigo"
      size="lg"
      zIndex={120}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            닫기
          </button>
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <i className="bx bx-edit" />
              정보 수정
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              <i className="bx bx-trash" />
              삭제
            </button>
          ) : null}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <div
            className={`rounded-2xl border p-4 ${
              isMatched
                ? "border-emerald-100 bg-emerald-50/80"
                : "border-rose-100 bg-rose-50/80"
            }`}
          >
            <h3
              className={`mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${
                isMatched ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              <i
                className={`bx ${
                  isMatched ? "bx-check-circle" : "bx-error-circle"
                } text-base`}
              />
              직무 매칭 결과
            </h3>
            <p className="text-sm font-bold text-slate-700">
              {match.matchedPositionName ||
                match.rawPosition ||
                "매칭된 직무 없음"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {match.reason}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
              기본 인적사항
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-xs font-bold text-slate-400">
                  <i className="bx bx-envelope mr-1" />
                  이메일
                </span>
                <p className="font-medium text-slate-700">
                  {candidate.email || "미기재"}
                </p>
              </li>
              <li>
                <span className="text-xs font-bold text-slate-400">
                  <i className="bx bx-phone mr-1" />
                  연락처
                </span>
                <p className="font-medium text-slate-700">
                  {candidate.phone || "미기재"}
                </p>
              </li>
              <li>
                <span className="text-xs font-bold text-slate-400">
                  <i className="bx bx-calendar mr-1" />
                  생년월일
                </span>
                <p className="font-medium text-slate-700">
                  {candidate.dateOfBirth || "미기재"}
                </p>
              </li>
              <li>
                <span className="text-xs font-bold text-slate-400">
                  <i className="bx bx-map mr-1" />
                  주소
                </span>
                <p className="font-medium leading-tight text-slate-700">
                  {candidate.address || "미기재"}
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-indigo-600">
              <i className="bx bx-bot text-base" />
              AI 핵심 요약
            </h3>
            <p className="text-sm font-medium leading-relaxed text-slate-700">
              {aiProfile.candidate_summary?.core_summary ||
                raw.record.resume.summary ||
                "요약 정보가 없습니다."}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
              보유 스킬 및 역량
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillChips.length > 0 ? (
                skillChips.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  추출된 스킬이 없습니다.
                </span>
              )}
            </div>
          </div>

          {aiProfile.recommended_question_topics?.length > 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                <i className="bx bx-message-rounded-dots text-base" />
                AI 면접 질문 추천
              </h3>
              <ul className="space-y-2">
                {aiProfile.recommended_question_topics.map((question, index) => (
                  <li
                    key={`${index}-${question.slice(0, 24)}`}
                    className="flex gap-2 text-sm text-slate-600"
                  >
                    <span className="font-black text-indigo-400">Q.</span>
                    <span className="font-medium">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </HrModal>
  );
}
