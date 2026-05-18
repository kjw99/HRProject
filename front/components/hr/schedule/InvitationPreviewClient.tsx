"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { candidateMailApi } from "@/lib/hr/mail.client";
import { emailTemplateApi } from "@/lib/hr/email-templates.client";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import { parseTemplateVariablesJson } from "@/lib/hr/template-variables";
import type { AvailableInterviewSlot } from "@/types/interviewBooking";
import type { EmailTemplate } from "@/types/emailTemplate";
import type {
  InvitationPreviewDraft,
  InvitationRecipientDraft,
  InvitationSendStatus,
  TemplateVariablesMap,
} from "@/types/invitationPreview";

const formatSlot = (slot: AvailableInterviewSlot) =>
  new Date(slot.interviewStartsAt).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const canUseMockPreview = () => {
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

const createMockDraft = (): InvitationPreviewDraft => {
  const base = new Date();
  base.setHours(10, 0, 0, 0);
  const slots: AvailableInterviewSlot[] = [
    {
      slotId: 9801,
      interviewRound: "1차",
      interviewStartsAt: base.toISOString(),
      interviewEndsAt: new Date(base.getTime() + 30 * 60 * 1000).toISOString(),
      interviewLocation: "본사 3층 회의실 A",
      remainingCapacity: 3,
    },
    {
      slotId: 9802,
      interviewRound: "1차",
      interviewStartsAt: new Date(
        base.getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      ).toISOString(),
      interviewEndsAt: new Date(
        base.getTime() + 24 * 60 * 60 * 1000 + 150 * 60 * 1000,
      ).toISOString(),
      interviewLocation: "온라인 Zoom",
      remainingCapacity: 1,
    },
  ];
  const invitationUrl = "http://localhost:3000/interview-booking?token=mock-token";

  return {
    createdAt: new Date().toISOString(),
    slotIds: slots.map((slot) => slot.slotId),
    slots,
    recipients: [
      {
        candidateId: 98001,
        name: "목업 지원자",
        email: "mock.candidate@example.com",
        invitationUrl,
        subject: "[면접 일정 선택 안내] 가능한 시간을 선택해주세요.",
        content: [
          "목업 지원자님, 안녕하세요.",
          "",
          "아래 링크에서 가능한 면접 일정을 선택해주세요.",
          "",
          invitationUrl,
          "",
          "[선택 가능한 면접 시간]",
          ...slots.map(
            (slot) =>
              `- ${formatSlot(slot)} · ${slot.interviewRound} · ${
                slot.interviewLocation ?? "장소 미정"
              }`,
          ),
          "",
          "감사합니다.",
        ].join("\n"),
      },
    ],
    failures: [],
  };
};

function readInvitationPreviewDraft(draftId: string): string | null {
  if (typeof window === "undefined") return null;
  const key = `interview-invitation-preview:${draftId}`;
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

const parseCustomVariables = parseTemplateVariablesJson;

const buildRecipientTemplateVariables = (
  recipient: InvitationRecipientDraft,
  draft: InvitationPreviewDraft,
  extraVariables: TemplateVariablesMap,
): TemplateVariablesMap => {
  const slotSummary = draft.slots
    .map(
      (slot) =>
        `${formatSlot(slot)} · ${slot.interviewRound} · ${
          slot.interviewLocation ?? "장소 미정"
        }`,
    )
    .join("\n");

  return {
    candidate_id: recipient.candidateId,
    candidateId: recipient.candidateId,
    candidate_name: recipient.name,
    candidateName: recipient.name,
    recipient_name: recipient.name,
    recipientName: recipient.name,
    candidate_email: recipient.email,
    candidateEmail: recipient.email,
    invitation_url: recipient.invitationUrl,
    access_link: recipient.invitationUrl,
    slot_count: draft.slotIds.length,
    slotCount: draft.slotIds.length,
    slot_summary: slotSummary,
    slotSummary,
    ...extraVariables,
  };
};

const normalizeTemplateTextForSend = (text: string, invitationUrl: string) =>
  text
    .replaceAll(invitationUrl, "{invitation_url}")
    .replaceAll("{access_link}", "{invitation_url}");

export default function InvitationPreviewClient() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft") ?? "";
  const [draft, setDraft] = useState<InvitationPreviewDraft | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statuses, setStatuses] = useState<Record<number, InvitationSendStatus>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [customVariablesText, setCustomVariablesText] = useState(
    JSON.stringify({ company_name: "ILJIN", recruiter_name: "HR Team" }, null, 2),
  );
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  useEffect(() => {
    if (!draftId) {
      if (canUseMockPreview()) {
        const mockDraft = createMockDraft();
        setDraft(mockDraft);
        setIsMockMode(true);
        setStatuses(
          Object.fromEntries(
            mockDraft.recipients.map((recipient) => [
              recipient.candidateId,
              "idle",
            ]),
          ),
        );
      }
      return;
    }

    const raw = readInvitationPreviewDraft(draftId);
    if (!raw) {
      if (canUseMockPreview()) {
        const mockDraft = createMockDraft();
        setDraft(mockDraft);
        setIsMockMode(true);
        setStatuses(
          Object.fromEntries(
            mockDraft.recipients.map((recipient) => [
              recipient.candidateId,
              "idle",
            ]),
          ),
        );
      }
      return;
    }

    try {
      const parsed = JSON.parse(raw) as InvitationPreviewDraft;
      setDraft(parsed);
      setIsMockMode(false);
      setStatuses(
        Object.fromEntries(
          parsed.recipients.map((recipient) => [recipient.candidateId, "idle"]),
        ),
      );
    } catch {
      toast.error("초대 메일 미리보기 데이터를 읽지 못했습니다.");
    }
  }, [draftId]);

  useEffect(() => {
    let cancelled = false;

    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const data = await emailTemplateApi.fetchEmailTemplates();
        if (cancelled) return;
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId((prev) => prev ?? data[0].id);
        }
      } catch (error) {
        if (cancelled) return;
        toast.error(
          getApiErrorMessage(error, "이메일 템플릿을 불러오지 못했습니다."),
        );
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
  }, []);

  const sentCount = useMemo(
    () => Object.values(statuses).filter((status) => status === "sent").length,
    [statuses],
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  const templateVariablesPreview = useMemo(() => {
    if (!draft || draft.recipients.length === 0) return null;

    try {
      const extraVariables = parseCustomVariables(customVariablesText);
      return buildRecipientTemplateVariables(
        draft.recipients[0],
        draft,
        extraVariables,
      );
    } catch {
      return null;
    }
  }, [customVariablesText, draft]);

  const updateRecipient = (
    candidateId: number,
    field: "subject" | "content",
    value: string,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recipients: prev.recipients.map((recipient) =>
          recipient.candidateId === candidateId
            ? { ...recipient, [field]: value }
            : recipient,
        ),
      };
    });
  };

  const copyAllLinks = async () => {
    if (!draft) return;
    const text = draft.recipients
      .map((recipient) => `${recipient.name}: ${recipient.invitationUrl}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("생성 링크 목록을 복사했습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const copySingleLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크를 복사했습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const applySelectedTemplate = async () => {
    if (!draft) return;
    if (!selectedTemplateId) {
      toast.error("적용할 템플릿을 선택해주세요.");
      return;
    }

    setIsApplyingTemplate(true);
    try {
      const extraVariables = parseCustomVariables(customVariablesText);
      const renderedRecipients = await Promise.all(
        draft.recipients.map(async (recipient) => {
          const variables = buildRecipientTemplateVariables(
            recipient,
            draft,
            extraVariables,
          );
          const rendered = await emailTemplateApi.renderEmailTemplate(
            selectedTemplateId,
            { variables },
          );

          return {
            ...recipient,
            subject: rendered.subject,
            content: rendered.body,
          };
        }),
      );

      setDraft((prev) =>
        prev
          ? {
              ...prev,
              recipients: renderedRecipients,
            }
          : prev,
      );
      toast.success("선택한 템플릿을 모든 수신자에게 적용했습니다.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "템플릿 적용 중 오류가 발생했습니다."),
      );
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const sendMail = async (recipient: InvitationRecipientDraft) => {
    setStatuses((prev) => ({ ...prev, [recipient.candidateId]: "sending" }));
    setErrors((prev) => ({ ...prev, [recipient.candidateId]: "" }));

    try {
      if (isMockMode) {
        setStatuses((prev) => ({ ...prev, [recipient.candidateId]: "sent" }));
        toast.success("mock 메일 발송 완료로 표시했습니다.");
        return;
      }

      await candidateMailApi.sendCandidateMail(recipient.candidateId, {
        subject: normalizeTemplateTextForSend(
          recipient.subject,
          recipient.invitationUrl,
        ),
        content: normalizeTemplateTextForSend(
          recipient.content,
          recipient.invitationUrl,
        ),
      });
      setStatuses((prev) => ({ ...prev, [recipient.candidateId]: "sent" }));
    } catch (error) {
      setStatuses((prev) => ({ ...prev, [recipient.candidateId]: "failed" }));
      setErrors((prev) => ({
        ...prev,
        [recipient.candidateId]: getApiErrorMessage(error, "메일 발송 실패"),
      }));
    }
  };

  const sendAllMails = async () => {
    if (!draft) return;

    for (const recipient of draft.recipients) {
      if (statuses[recipient.candidateId] === "sent") continue;
      await sendMail(recipient);
    }
    toast.success("최종 메일 발송 처리가 완료되었습니다.");
  };

  if (!draft) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <i className="bx bx-error-circle text-4xl text-amber-500" />
          <h1 className="mt-3 text-lg font-black text-slate-900">
            미리보기 데이터를 찾을 수 없습니다.
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            초대 링크 생성 화면에서 다시 이동해주세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                Invitation Preview
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                초대 링크 및 최종 메일 확인
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                링크를 확인하고, 템플릿을 적용하거나 직접 수정한 뒤 최종 발송하세요.
              </p>
              {isMockMode ? (
                <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                  개발용 mock 미리보기입니다.
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={copyAllLinks}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <i className="bx bx-copy" />
                생성 링크 전체 복사
              </button>
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
              >
                <i className="bx bx-edit" />
                {isEditing ? "수정 완료" : "메일 내용 수정"}
              </button>
              <button
                type="button"
                onClick={() => void sendAllMails()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <i className="bx bx-send" />
                최종 메일 보내기
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase text-slate-400">
                대상자
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {draft.recipients.length}명
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase text-slate-400">
                선택 후보
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {draft.slotIds.length}개
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase text-slate-400">
                발송 완료
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {sentCount}/{draft.recipients.length}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                  Template Assist
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-900">
                  템플릿 적용
                </h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  템플릿을 전체 수신자 초안에 한 번에 반영할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void applySelectedTemplate()}
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
                    setSelectedTemplateId(
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
                onChange={(event) => setCustomVariablesText(event.target.value)}
                rows={8}
                className="font-mono resize-y rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">
              Variable Preview
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900">
              첫 번째 수신자 기준 렌더 변수
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              템플릿에는 아래 키들을 사용할 수 있습니다.
            </p>
            <pre className="mt-4 max-h-[320px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs font-semibold leading-6 text-slate-100">
              {templateVariablesPreview
                ? JSON.stringify(templateVariablesPreview, null, 2)
                : "추가 변수 JSON을 확인해주세요."}
            </pre>
          </div>
        </section>

        {draft.slots.length > 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">
              지원자에게 열릴 면접 후보
            </h2>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {draft.slots.map((slot) => (
                <li
                  key={slot.slotId}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                >
                  {formatSlot(slot)} · {slot.interviewRound} ·{" "}
                  {slot.interviewLocation ?? "장소 미정"}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {draft.failures.length > 0 ? (
          <section className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <h2 className="text-sm font-black text-rose-700">링크 생성 실패</h2>
            <ul className="mt-3 space-y-2 text-sm font-bold text-rose-700">
              {draft.failures.map((failure) => (
                <li key={failure.candidateId}>
                  {failure.name}: {failure.error ?? "초대 링크 생성 실패"}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="space-y-4">
          {draft.recipients.map((recipient, index) => {
            const status = statuses[recipient.candidateId] ?? "idle";
            return (
              <motion.article
                key={recipient.candidateId}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-slate-900">
                      {recipient.name}
                    </h2>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {recipient.email ?? "이메일 미기재"} · 후보자 #
                      {recipient.candidateId}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copySingleLink(recipient.invitationUrl)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                    >
                      <i className="bx bx-link" />
                      링크 복사
                    </button>
                    <button
                      type="button"
                      onClick={() => void sendMail(recipient)}
                      disabled={status === "sending" || status === "sent"}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-black text-white hover:bg-indigo-700 disabled:opacity-45"
                    >
                      <i
                        className={
                          status === "sending"
                            ? "bx bx-loader-alt animate-spin"
                            : "bx bx-send"
                        }
                      />
                      {status === "sent" ? "발송 완료" : "개별 발송"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="break-all font-mono text-xs font-bold text-slate-600">
                    {recipient.invitationUrl}
                  </p>
                </div>

                <div className="mt-4 grid gap-3">
                  <label className="grid gap-1.5 text-xs font-black text-slate-500">
                    메일 제목
                    <input
                      value={recipient.subject}
                      readOnly={!isEditing}
                      onChange={(event) =>
                        updateRecipient(
                          recipient.candidateId,
                          "subject",
                          event.target.value,
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none read-only:bg-slate-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-black text-slate-500">
                    최종 메일 내용
                    <textarea
                      value={recipient.content}
                      readOnly={!isEditing}
                      rows={9}
                      onChange={(event) =>
                        updateRecipient(
                          recipient.candidateId,
                          "content",
                          event.target.value,
                        )
                      }
                      className="resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-6 text-slate-800 outline-none read-only:bg-slate-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                </div>

                {status === "failed" ? (
                  <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">
                    {errors[recipient.candidateId]}
                  </p>
                ) : status === "sent" ? (
                  <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    최종 메일을 발송했습니다.
                  </p>
                ) : null}
              </motion.article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
