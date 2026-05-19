"use client";

import { memo } from "react";
import type { EmailTemplate } from "@/types/emailTemplate";

export interface InvitationTemplateAssistPanelProps {
  templates: EmailTemplate[];
  selectedTemplateId: number | null;
  isLoadingTemplates: boolean;
  isApplyingTemplate: boolean;
  customVariablesText: string;
  selectedTemplate: EmailTemplate | null;
  onSelectTemplate: (id: number | null) => void;
  onChangeCustomVariables: (text: string) => void;
  onApplyTemplate: () => void;
}

function InvitationTemplateAssistPanelImpl({
  templates,
  selectedTemplateId,
  isLoadingTemplates,
  isApplyingTemplate,
  customVariablesText,
  selectedTemplate,
  onSelectTemplate,
  onChangeCustomVariables,
  onApplyTemplate,
}: InvitationTemplateAssistPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Template Assist
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-900">템플릿 적용</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            템플릿을 전체 수신자 초안에 한 번에 반영할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onApplyTemplate}
          disabled={
            isApplyingTemplate || isLoadingTemplates || selectedTemplateId === null
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i
            className={`bx ${
              isApplyingTemplate ? "bx-loader-alt animate-spin" : "bx-brush"
            }`}
          />
          템플릿 전체 적용
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <label className="grid gap-2 text-sm font-black text-slate-600">
          템플릿 선택
          <select
            value={selectedTemplateId ?? ""}
            onChange={(event) =>
              onSelectTemplate(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">
              {isLoadingTemplates
                ? "템플릿 불러오는 중..."
                : "템플릿을 선택하세요"}
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            선택된 템플릿 제목
          </p>
          <p className="mt-2 text-sm font-black text-slate-900">
            {selectedTemplate?.subject ?? "선택된 템플릿이 없습니다."}
          </p>
          <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-500">
            {selectedTemplate?.body ?? "본문 미리보기가 여기에 표시됩니다."}
          </p>
        </div>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-black text-slate-600">
        추가 변수 JSON
        <textarea
          value={customVariablesText}
          onChange={(event) => onChangeCustomVariables(event.target.value)}
          rows={8}
          spellCheck={false}
          className="font-mono resize-y rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
        />
      </label>
    </div>
  );
}

export const InvitationTemplateAssistPanel = memo(
  InvitationTemplateAssistPanelImpl,
);
