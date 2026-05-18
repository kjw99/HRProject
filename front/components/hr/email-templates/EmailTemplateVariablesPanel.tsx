"use client";

import {
  EMAIL_TEMPLATE_LABEL_CLASS,
  EMAIL_TEMPLATE_UI,
} from "./email-template.constants";
import type { EmailTemplateVariablesPanelProps } from "@/types/email-template-ui";

const { variables } = EMAIL_TEMPLATE_UI;

export default function EmailTemplateVariablesPanel({
  placeholderKeys,
  variablesInput,
  onVariablesInputChange,
}: EmailTemplateVariablesPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
        <i className="bx bx-code-alt text-xl text-indigo-500" />
        {variables.title}
      </h3>

      <div className="mt-4">
        {placeholderKeys.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {placeholderKeys.map((key) => (
              <span
                key={key}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700"
              >
                {`{${key}}`}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-500">
            {variables.emptyHint}
          </p>
        )}
      </div>

      <label className={`${EMAIL_TEMPLATE_LABEL_CLASS} mt-4`}>
        {variables.jsonLabel}
        <textarea
          value={variablesInput}
          onChange={(event) => onVariablesInputChange(event.target.value)}
          rows={10}
          spellCheck={false}
          className="hide-scrollbar resize-y rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
        />
      </label>
    </section>
  );
}
