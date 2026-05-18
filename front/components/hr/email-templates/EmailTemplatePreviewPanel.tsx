"use client";

import { EMAIL_TEMPLATE_UI } from "./email-template.constants";
import type { EmailTemplatePreviewPanelProps } from "@/types/email-template-ui";

const { preview } = EMAIL_TEMPLATE_UI;

export default function EmailTemplatePreviewPanel({
  preview: rendered,
  isRendering,
}: EmailTemplatePreviewPanelProps) {
  const hasPreview = Boolean(rendered?.subject || rendered?.body);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
        <i className="bx bx-show text-xl text-emerald-500" />
        {preview.title}
      </h3>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {isRendering ? (
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
            <i className="bx bx-loader-alt animate-spin text-lg" />
            미리보기를 생성하는 중입니다…
          </p>
        ) : hasPreview ? (
          <>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {preview.subjectLabel}
            </p>
            <p className="mt-1 text-base font-black text-slate-900">
              {rendered?.subject}
            </p>
            <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
              {preview.bodyLabel}
            </p>
            <pre className="hide-scrollbar mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">
              {rendered?.body}
            </pre>
          </>
        ) : (
          <p className="text-sm font-semibold text-slate-500">
            {preview.emptyHint}
          </p>
        )}
      </div>
    </section>
  );
}
