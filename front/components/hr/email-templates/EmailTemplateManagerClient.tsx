"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { emailTemplateApi } from "@/lib/hr/email-templates.client";
import {
  extractEmailTemplateKeys,
  parseTemplateVariablesJson,
} from "@/lib/hr/template-variables";
import type { EmailTemplate, EmailTemplateRenderResponse } from "@/types/emailTemplate";

interface EmailTemplateManagerClientProps {
  initialTemplates: EmailTemplate[];
}

interface EmailTemplateFormState {
  name: string;
  subject: string;
  body: string;
}

const EMPTY_FORM: EmailTemplateFormState = {
  name: "",
  subject: "",
  body: "",
};

const DEFAULT_VARIABLES = {
  candidate_name: "\uD64D\uAE38\uB3D9",
  candidate_email: "hong@example.com",
  invitation_url: "https://example.com/interview-booking?token=preview",
  access_link: "https://example.com/interview-booking?token=preview",
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";

const labelClassName = "grid gap-2 text-sm font-black text-slate-600";

export default function EmailTemplateManagerClient({
  initialTemplates,
}: EmailTemplateManagerClientProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    initialTemplates[0]?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<EmailTemplateFormState>(EMPTY_FORM);
  const [variablesInput, setVariablesInput] = useState(
    JSON.stringify(DEFAULT_VARIABLES, null, 2),
  );
  const [preview, setPreview] = useState<EmailTemplateRenderResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTemplates = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return templates;

    return templates.filter((template) =>
      [template.name, template.subject, template.body]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [searchQuery, templates]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  const placeholderKeys = useMemo(
    () =>
      selectedTemplate ? extractEmailTemplateKeys(selectedTemplate) : [],
    [selectedTemplate],
  );

  useEffect(() => {
    if (!selectedTemplate) {
      setForm(EMPTY_FORM);
      setPreview(null);
      return;
    }

    setForm({
      name: selectedTemplate.name,
      subject: selectedTemplate.subject,
      body: selectedTemplate.body,
    });
    setPreview(null);
  }, [selectedTemplate]);

  const handleNewTemplate = () => {
    setSelectedTemplateId(null);
    setForm(EMPTY_FORM);
    setPreview(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error("\uD15C\uD50C\uB9BF \uC774\uB984, \uC81C\uBAA9, \uBCF8\uBB38\uC744 \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedTemplateId === null) {
        const created = await emailTemplateApi.createEmailTemplate({
          name: form.name.trim(),
          subject: form.subject.trim(),
          body: form.body,
        });
        setTemplates((prev) => [created, ...prev]);
        setSelectedTemplateId(created.id);
        toast.success("\uC774\uBA54\uC77C \uD15C\uD50C\uB9BF\uC744 \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4.");
      } else {
        const updated = await emailTemplateApi.updateEmailTemplate(selectedTemplateId, {
          name: form.name.trim(),
          subject: form.subject.trim(),
          body: form.body,
        });
        setTemplates((prev) =>
          prev.map((template) =>
            template.id === updated.id ? updated : template,
          ),
        );
        toast.success("\uC774\uBA54\uC77C \uD15C\uD50C\uB9BF\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "\uD15C\uD50C\uB9BF \uC800\uC7A5 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTemplateId === null) return;

    const ok = window.confirm("\uC120\uD0DD\uD55C \uD15C\uD50C\uB9BF\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?");
    if (!ok) return;

    setIsDeleting(true);
    try {
      await emailTemplateApi.deleteEmailTemplate(selectedTemplateId);
      const nextTemplates = templates.filter(
        (template) => template.id !== selectedTemplateId,
      );
      setTemplates(nextTemplates);
      setSelectedTemplateId(nextTemplates[0]?.id ?? null);
      if (nextTemplates.length === 0) {
        setForm(EMPTY_FORM);
      }
      setPreview(null);
      toast.success("\uC774\uBA54\uC77C \uD15C\uD50C\uB9BF\uC744 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "\uD15C\uD50C\uB9BF \uC0AD\uC81C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenderPreview = async () => {
    if (selectedTemplateId === null) {
      toast.error(
        "\uBA3C\uC800 \uC800\uC7A5\uB41C \uD15C\uD50C\uB9BF\uC744 \uC120\uD0DD\uD558\uAC70\uB098 \uC0DD\uC131\uD574\uC8FC\uC138\uC694.",
      );
      return;
    }

    setIsRendering(true);
    try {
      const variables = parseTemplateVariablesJson(variablesInput);
      const rendered = await emailTemplateApi.renderEmailTemplate(selectedTemplateId, {
        variables,
      });
      setPreview(rendered);
      toast.success("\uBBF8\uB9AC\uBCF4\uAE30\uB97C \uC5C5\uB370\uC774\uD2B8\uD588\uC2B5\uB2C8\uB2E4.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "\uBBF8\uB9AC\uBCF4\uAE30 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";
      toast.error(message);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="flex max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-500">
                Template Library
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
                ??? ??
              </h2>
            </div>
            <button
              type="button"
              onClick={handleNewTemplate}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-slate-900 px-3.5 text-xs font-black text-white transition hover:bg-slate-800 sm:h-11 sm:px-4 sm:text-sm"
            >
              <i className="bx bx-plus text-base" />
              ? ???
            </button>
          </div>
          <div className="relative mt-4">
            <i className="bx bx-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="???????? ??"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <i className="bx bx-file-blank text-3xl text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">
                ?? ??? ????.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredTemplates.map((template) => {
                const isActive = template.id === selectedTemplateId;
                return (
                  <li key={template.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-indigo-200 bg-indigo-50 shadow-sm ring-1 ring-indigo-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-black text-slate-900">{template.name}</p>
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
      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-500">Editor</p>
              <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
                {selectedTemplateId === null ? "? ??? ??" : "??? ??"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void handleRenderPreview()} disabled={isRendering || selectedTemplateId === null} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60">
                <i className={`bx ${isRendering ? "bx-loader-alt animate-spin" : "bx-show"}`} />
                ????
              </button>
              {selectedTemplateId !== null ? (
                <button type="button" onClick={() => void handleDelete()} disabled={isDeleting} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60">
                  <i className={`bx ${isDeleting ? "bx-loader-alt animate-spin" : "bx-trash"}`} />
                  ??
                </button>
              ) : null}
              <button type="button" onClick={() => void handleSave()} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                <i className={`bx ${isSaving ? "bx-loader-alt animate-spin" : "bx-save"}`} />
                ??
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            <label className={labelClassName}>
              ??? ??
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClassName} />
            </label>
            <label className={labelClassName}>
              ??
              <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className={inputClassName} />
            </label>
            <label className={labelClassName}>
              ??
              <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={12} className={`${inputClassName} resize-y leading-6`} />
            </label>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-slate-900">???? ??</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {placeholderKeys.map((key) => (
                <span key={key} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">{`{${key}}`}</span>
              ))}
            </div>
            <label className={`${labelClassName} mt-4`}>
              JSON
              <textarea value={variablesInput} onChange={(e) => setVariablesInput(e.target.value)} rows={10} className="resize-y rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-slate-100 outline-none" />
            </label>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-slate-900">?? ??</h3>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-base font-black text-slate-900">{preview?.subject ?? "-"}</p>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-sm font-semibold text-slate-700">{preview?.body ?? "-"}</pre>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
