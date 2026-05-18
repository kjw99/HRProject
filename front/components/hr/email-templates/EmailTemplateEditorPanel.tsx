"use client";

import {
  EMAIL_TEMPLATE_INPUT_CLASS,
  EMAIL_TEMPLATE_LABEL_CLASS,
  EMAIL_TEMPLATE_UI,
} from "./email-template.constants";
import type { EmailTemplateEditorPanelProps } from "@/types/email-template-ui";

const { editor } = EMAIL_TEMPLATE_UI;

export default function EmailTemplateEditorPanel({
  isNew,
  form,
  onFormChange,
  isSaving,
  isDeleting,
  isRendering,
  canDelete,
  canPreview,
  onSave,
  onDelete,
  onPreview,
}: EmailTemplateEditorPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-500">
            {editor.eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
            {isNew ? editor.titleNew : editor.titleEdit}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPreview}
            disabled={isRendering || !canPreview}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i
              className={`bx ${
                isRendering ? "bx-loader-alt animate-spin" : "bx-show"
              } text-lg`}
            />
            {editor.previewButton}
          </button>

          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i
                className={`bx ${
                  isDeleting ? "bx-loader-alt animate-spin" : "bx-trash"
                } text-lg`}
              />
              {editor.deleteButton}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i
              className={`bx ${
                isSaving ? "bx-loader-alt animate-spin" : "bx-save"
              } text-lg`}
            />
            {editor.saveButton}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <label className={EMAIL_TEMPLATE_LABEL_CLASS}>
          {editor.nameLabel}
          <input
            value={form.name}
            onChange={(event) => onFormChange({ name: event.target.value })}
            placeholder="예: 지원자 면접 초대 (1차)"
            className={EMAIL_TEMPLATE_INPUT_CLASS}
          />
        </label>

        <label className={EMAIL_TEMPLATE_LABEL_CLASS}>
          {editor.subjectLabel}
          <input
            value={form.subject}
            onChange={(event) => onFormChange({ subject: event.target.value })}
            placeholder="예: [회사명] 면접 일정 안내"
            className={EMAIL_TEMPLATE_INPUT_CLASS}
          />
        </label>

        <label className={EMAIL_TEMPLATE_LABEL_CLASS}>
          {editor.bodyLabel}
          <textarea
            value={form.body}
            onChange={(event) => onFormChange({ body: event.target.value })}
            rows={12}
            placeholder="본문에 {candidate_name}, {invitation_url} 등을 넣을 수 있습니다."
            className={`${EMAIL_TEMPLATE_INPUT_CLASS} resize-y leading-6`}
          />
        </label>
      </div>
    </section>
  );
}
