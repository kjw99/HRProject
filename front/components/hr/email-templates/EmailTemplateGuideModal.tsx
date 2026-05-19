"use client";

import { memo } from "react";
import HrModal from "@/components/hr/shared/HrModal";
import {
  EMAIL_TEMPLATE_GUIDE_STEPS,
  EMAIL_TEMPLATE_GUIDE_TIPS,
  EMAIL_TEMPLATE_RECOMMENDED_KEYS,
} from "./email-template.constants";

export interface EmailTemplateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 체크 상태 (다음 방문부터 자동 오픈 비활성화) */
  dontShowAgain: boolean;
  onToggleDontShowAgain: (next: boolean) => void;
}

function EmailTemplateGuideModalImpl({
  isOpen,
  onClose,
  dontShowAgain,
  onToggleDontShowAgain,
}: EmailTemplateGuideModalProps) {
  return (
    <HrModal
      isOpen={isOpen}
      onClose={onClose}
      title="템플릿 제작 가이드"
      subtitle="네 단계만 따라가면 반복 발송 메일 문구를 깔끔하게 자동화할 수 있어요."
      eyebrow="How to use"
      eyebrowIcon="book-open"
      theme="amber"
      size="xl"
      footer={
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex select-none items-center gap-2 text-xs font-bold text-slate-500 sm:text-sm">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => onToggleDontShowAgain(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            다음 방문부터 자동으로 보지 않기
          </label>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-amber-600"
          >
            <i className="bx bx-check text-lg" />
            확인했어요
          </button>
        </div>
      }
    >
      <div className="space-y-5 p-5 sm:space-y-6 sm:p-6">
        {/* STEPS */}
        <ol className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {EMAIL_TEMPLATE_GUIDE_STEPS.map((step) => (
            <li
              key={step.id}
              className="flex h-full flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 transition hover:border-amber-200 hover:bg-amber-50 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                  <i className={`bx bx-${step.icon} text-xl`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 sm:text-base">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 sm:text-sm sm:leading-6">
                    {step.description}
                  </p>
                </div>
              </div>
              {step.example ? (
                <pre className="hide-scrollbar overflow-x-auto rounded-xl bg-slate-950 px-3 py-2.5 font-mono text-[11px] leading-5 text-amber-100 sm:text-xs">
                  {step.example}
                </pre>
              ) : null}
            </li>
          ))}
        </ol>

        {/* RECOMMENDED VARIABLES */}
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <i className="bx bx-purchase-tag-alt text-lg text-indigo-500" />
            <h3 className="text-sm font-black text-slate-900 sm:text-base">
              권장 변수 목록
            </h3>
          </div>
          <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-600 sm:text-sm">
            아래 키들은 시스템이 자동으로 값을 채워주므로 그대로 사용하시면 돼요.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {EMAIL_TEMPLATE_RECOMMENDED_KEYS.map((key) => (
              <li key={key}>
                <code className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-black text-indigo-700">
                  {`{${key}}`}
                </code>
              </li>
            ))}
          </ul>
        </section>

        {/* TIPS */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <i className="bx bx-info-circle text-lg text-slate-500" />
            <h3 className="text-sm font-black text-slate-900 sm:text-base">
              알아두면 좋은 팁
            </h3>
          </div>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {EMAIL_TEMPLATE_GUIDE_TIPS.map((tip) => (
              <li
                key={tip.label}
                className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <i className={`bx bx-${tip.icon} text-base`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900">
                    {tip.label}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-4 text-slate-500 sm:text-xs sm:leading-5">
                    {tip.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </HrModal>
  );
}

export const EmailTemplateGuideModal = memo(EmailTemplateGuideModalImpl);
export default EmailTemplateGuideModal;
