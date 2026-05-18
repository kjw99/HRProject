"use client";

import { EMAIL_TEMPLATE_UI } from "./email-template.constants";
import type { EmailTemplateListPanelProps } from "@/types/email-template-ui";

const { list } = EMAIL_TEMPLATE_UI;

export default function EmailTemplateListPanel({
  templates,
  selectedTemplateId,
  searchQuery,
  onSearchChange,
  onSelect,
  onCreateNew,
}: EmailTemplateListPanelProps) {
  return (
    <section className="flex max-h-[calc(100vh-12rem)] min-h-[320px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-500">
              {list.eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
              {list.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-slate-900 px-3.5 text-xs font-black text-white transition hover:bg-slate-800 sm:h-11 sm:px-4 sm:text-sm"
          >
            <i className="bx bx-plus text-base" />
            {list.newButton}
          </button>
        </div>

        <label className="relative mt-4 block">
          <span className="sr-only">{list.searchPlaceholder}</span>
          <i className="bx bx-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={list.searchPlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
      </div>

      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
              <i className="bx bx-file-blank text-2xl" />
            </span>
            <p className="text-sm font-black text-slate-700">{list.emptyTitle}</p>
            <p className="text-xs font-semibold text-slate-500">{list.emptyHint}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {templates.map((template) => {
              const isActive = template.id === selectedTemplateId;
              return (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(template.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-indigo-200 bg-indigo-50 shadow-sm ring-1 ring-indigo-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-black text-slate-900">
                      {template.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs font-bold text-slate-500">
                      {template.subject}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
