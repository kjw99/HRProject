"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { candidateMailApi } from "@/lib/hr/mail.client";
import { emailTemplateApi } from "@/lib/hr/email-templates.client";
import type { Applicant } from "@/types/applicant";
import type { EmailTemplate } from "@/types/emailTemplate";

interface CandidateMailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
}

type TemplateVariableValue = string | number | boolean | null;

const DEFAULT_EXTRA_VARIABLES = {
  company_name: "ILJIN",
  recruiter_name: "HR Team",
};

const parseVariables = (
  value: string,
): Record<string, TemplateVariableValue> => {
  if (!value.trim()) return {};

  const parsed = JSON.parse(value) as Record<string, TemplateVariableValue>;
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("추가 변수는 JSON 객체 형태여야 합니다.");
  }

  return parsed;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    response?: { data?: { message?: string; detail?: string } };
    message?: string;
  };

  return (
    maybe.response?.data?.message ||
    maybe.response?.data?.detail ||
    maybe.message ||
    fallback
  );
};

const createTemplateVariables = (
  applicant: Applicant,
  extraVariables: Record<string, TemplateVariableValue>,
): Record<string, TemplateVariableValue> => ({
  candidate_id: applicant.candidate_id,
  candidateId: applicant.candidate_id,
  candidate_name: applicant.name,
  candidateName: applicant.name,
  candidate_email: applicant.email,
  candidateEmail: applicant.email,
  position_id: applicant.position_id,
  positionId: applicant.position_id,
  phone: applicant.phone,
  date_of_birth: applicant.date_of_birth,
  invitation_url: "{invitation_url}",
  access_link: "{invitation_url}",
  ...extraVariables,
});

export default function CandidateMailComposerModal({
  isOpen,
  onClose,
  applicant,
}: CandidateMailComposerModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [extraVariablesText, setExtraVariablesText] = useState(
    JSON.stringify(DEFAULT_EXTRA_VARIABLES, null, 2),
  );
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const data = await emailTemplateApi.fetchEmailTemplates();
        if (cancelled) return;
        setTemplates(data);
        setSelectedTemplateId((prev) => prev ?? data[0]?.id ?? null);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            getErrorMessage(error, "이메일 템플릿을 불러오지 못했습니다."),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTemplates(false);
        }
      }
    };

    void loadTemplates();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSubject("");
    setContent("");
  }, [applicant, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !applicant) return null;

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error("적용할 템플릿을 선택해주세요.");
      return;
    }

    setIsApplyingTemplate(true);
    try {
      const extraVariables = parseVariables(extraVariablesText);
      const variables = createTemplateVariables(applicant, extraVariables);
      const rendered = await emailTemplateApi.renderEmailTemplate(selectedTemplateId, {
        variables,
      });
      setSubject(rendered.subject);
      setContent(rendered.body);
      toast.success("템플릿을 메일 초안에 반영했습니다.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "템플릿 적용 중 오류가 발생했습니다."),
      );
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const handleSend = async () => {
    if (!applicant.email) {
      toast.error("이 지원자는 이메일 주소가 없어 발송할 수 없습니다.");
      return;
    }

    if (!subject.trim() || !content.trim()) {
      toast.error("메일 제목과 본문을 입력해주세요.");
      return;
    }

    setIsSending(true);
    try {
      const response = await candidateMailApi.sendCandidateMail(applicant.candidate_id, {
        subject: subject.trim(),
        content,
      });
      toast.success(response.message);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "메일 발송 중 오류가 발생했습니다."));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-500">
              Candidate Mail
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              지원자 메일 보내기
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {applicant.name} · {applicant.email ?? "이메일 미등록"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-white hover:text-slate-600"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="border-b border-slate-100 bg-slate-50/70 p-5 xl:border-b-0 xl:border-r xl:border-slate-100">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-500">
                  Template
                </p>
                <h3 className="mt-1 text-base font-black text-slate-900">
                  템플릿 선택
                </h3>
              </div>

              <label className="grid gap-2 text-sm font-black text-slate-600">
                이메일 템플릿
                <select
                  value={selectedTemplateId ?? ""}
                  onChange={(event) =>
                    setSelectedTemplateId(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
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

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  선택된 템플릿
                </p>
                <p className="mt-2 text-sm font-black text-slate-900">
                  {selectedTemplate?.subject ?? "선택된 템플릿이 없습니다."}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-500">
                  {selectedTemplate?.body ?? "템플릿 본문이 여기에 표시됩니다."}
                </p>
              </div>

              <label className="grid gap-2 text-sm font-black text-slate-600">
                추가 변수 JSON
                <textarea
                  value={extraVariablesText}
                  onChange={(event) => setExtraVariablesText(event.target.value)}
                  rows={8}
                  className="resize-y rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  자동 변수
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {"{candidate_name}, {candidate_email}, {position_id}, {phone}, {invitation_url}"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleApplyTemplate()}
                disabled={isApplyingTemplate || !selectedTemplateId}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i
                  className={`bx ${
                    isApplyingTemplate ? "bx-loader-alt animate-spin" : "bx-brush"
                  }`}
                />
                템플릿 적용
              </button>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-5 sm:p-6">
              <label className="grid gap-2 text-sm font-black text-slate-600">
                메일 제목
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="[회사명] 면접 일정 안내"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-600">
                메일 본문
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={14}
                  placeholder="메일 본문을 입력하거나 템플릿을 적용해주세요."
                  className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                템플릿에 <code>{"{invitation_url}"}</code>를 넣어두면 발송 시 실제 예약 링크로 자동 치환됩니다.
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm font-semibold text-slate-500">
                {applicant.email
                  ? `${applicant.email} 로 발송됩니다.`
                  : "이메일 주소가 없어 발송 버튼이 비활성화됩니다."}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={isSending || !applicant.email}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i
                    className={`bx ${
                      isSending ? "bx-loader-alt animate-spin" : "bx-send"
                    }`}
                  />
                  메일 발송
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
