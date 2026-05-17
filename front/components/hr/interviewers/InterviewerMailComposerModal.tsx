"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import HrModal from "@/components/hr/shared/HrModal";
import { emailTemplateApi } from "@/lib/hr/email-templates.client";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import { interviewerMailApi } from "@/lib/hr/interviewer-mail.client";
import { parseTemplateVariablesJson } from "@/lib/hr/template-variables";
import type { EmailTemplate } from "@/types/emailTemplate";
import type { HrInterviewer } from "@/types/interviewer";

interface InterviewerMailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewer: HrInterviewer | null;
}

const DEFAULT_VARIABLES = {
  company_name: "ILJIN",
  sender_name: "HR Team",
};

export default function InterviewerMailComposerModal({
  isOpen,
  onClose,
  interviewer,
}: InterviewerMailComposerModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [customVariablesText, setCustomVariablesText] = useState(
    JSON.stringify(DEFAULT_VARIABLES, null, 2),
  );
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

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
            getApiErrorMessage(error, "이메일 템플릿을 불러오지 못했습니다."),
          );
        }
      } finally {
        if (!cancelled) setIsLoadingTemplates(false);
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
    setInviteUrl(null);
  }, [interviewer, isOpen]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  if (!interviewer) return null;

  const buildVariables = () => ({
    interviewer_id: interviewer.interviewerId,
    interviewerId: interviewer.interviewerId,
    interviewer_name: interviewer.interviewerName,
    interviewerName: interviewer.interviewerName,
    interviewer_email: interviewer.interviewerEmail,
    interviewerEmail: interviewer.interviewerEmail,
    position_name: interviewer.positionName ?? "",
    positionName: interviewer.positionName ?? "",
    interview_round: interviewer.interviewRound ?? "",
    interviewRound: interviewer.interviewRound ?? "",
    invite_url: "{invite_url}",
    access_link: "{invite_url}",
    ...parseTemplateVariablesJson(customVariablesText),
  });

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error("적용할 템플릿을 선택해주세요.");
      return;
    }

    setIsApplyingTemplate(true);
    try {
      const rendered = await emailTemplateApi.renderEmailTemplate(
        selectedTemplateId,
        {
          variables: buildVariables(),
        },
      );
      setSubject(rendered.subject);
      setContent(rendered.body);
      toast.success("템플릿을 메일 초안에 반영했습니다.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "메일 템플릿 적용 중 오류가 발생했습니다."),
      );
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("메일 제목과 본문을 입력해주세요.");
      return;
    }

    setIsSending(true);
    try {
      const response = await interviewerMailApi.sendInterviewerMail(
        interviewer.interviewerId,
        {
          subject: subject.trim(),
          content,
          expiresInDays,
        },
      );
      setInviteUrl(response.inviteUrl ?? null);
      toast.success(response.message);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "면접관 메일 발송 중 오류가 발생했습니다."),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <HrModal
      isOpen={isOpen}
      onClose={() => !isSending && onClose()}
      title="면접관 메일 보내기"
      subtitle={`${interviewer.interviewerName} · ${interviewer.interviewerEmail}`}
      eyebrow="Interviewer Mail"
      eyebrowIcon="envelope"
      theme="indigo"
      size="xl"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <i
              className={`bx ${
                isSending ? "bx-loader-alt animate-spin" : "bx-send"
              } text-lg`}
            />
            메일 발송
          </button>
        </div>
      }
    >
      <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <label className="grid gap-2 text-sm font-black text-slate-600">
            이메일 템플릿
            <select
              value={selectedTemplateId ?? ""}
              onChange={(event) =>
                setSelectedTemplateId(
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
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

          <label className="grid gap-2 text-sm font-black text-slate-600">
            링크 유효 기간
            <select
              value={expiresInDays}
              onChange={(event) => setExpiresInDays(Number(event.target.value))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            >
              {[3, 5, 7, 14, 30].map((day) => (
                <option key={day} value={day}>
                  {day}일
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
              {selectedTemplate?.body ?? "본문 미리보기가 여기에 표시됩니다."}
            </p>
          </div>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            추가 변수 JSON
            <textarea
              value={customVariablesText}
              onChange={(event) => setCustomVariablesText(event.target.value)}
              rows={10}
              className="resize-y rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <button
            type="button"
            onClick={() => void handleApplyTemplate()}
            disabled={isApplyingTemplate || !selectedTemplateId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-indigo-700 ring-1 ring-indigo-100 transition hover:bg-indigo-50 disabled:opacity-50"
          >
            <i
              className={`bx ${
                isApplyingTemplate ? "bx-loader-alt animate-spin" : "bx-brush"
              } text-lg`}
            />
            템플릿 적용
          </button>
        </aside>

        <section className="grid gap-4">
          <label className="grid gap-2 text-sm font-black text-slate-600">
            메일 제목
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="[회사명] 면접관 초대 안내"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-600">
            메일 본문
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={14}
              className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/70 px-4 py-3 text-sm font-semibold leading-6 text-indigo-700">
            메일 템플릿에서 <code>{"{invite_url}"}</code> 또는{" "}
            <code>{"{access_link}"}</code>를 사용하면 발송 시 실제 초대 링크로
            치환됩니다.
          </div>

          {inviteUrl ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                Last Sent Invite
              </p>
              <p className="mt-2 break-all font-mono text-sm font-bold text-emerald-700">
                {inviteUrl}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </HrModal>
  );
}
