"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { candidateMailApi } from "@/lib/hr/mail.client";
import { emailTemplateApi } from "@/lib/hr/email-templates.client";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import {
  buildInitialRecipientStates,
  buildRecipientTemplateVariables,
  buildSlotSummary,
  canUseMockPreview,
  createMockDraft,
  normalizeTemplateTextForSend,
  parseCustomVariables,
  readInvitationPreviewDraft,
  type RecipientUiState,
} from "@/lib/hr/invitation-preview.helpers";
import { InvitationFailureList } from "./InvitationFailureList";
import { InvitationPreviewHeader } from "./InvitationPreviewHeader";
import {
  InvitationRecipientCard,
  type InvitationRecipientCardProps,
} from "./InvitationRecipientCard";
import { InvitationSlotCandidatesPanel } from "./InvitationSlotCandidatesPanel";
import { InvitationTemplateAssistPanel } from "./InvitationTemplateAssistPanel";
import { InvitationVariablePreviewPanel } from "./InvitationVariablePreviewPanel";
import type { EmailTemplate } from "@/types/emailTemplate";
import type {
  InvitationPreviewDraft,
  InvitationRecipientDraft,
} from "@/types/invitationPreview";

const DEFAULT_CUSTOM_VARIABLES_TEXT = JSON.stringify(
  { company_name: "ILJIN", recruiter_name: "HR Team" },
  null,
  2,
);

export default function InvitationPreviewClient() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft") ?? "";

  const [draft, setDraft] = useState<InvitationPreviewDraft | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // recipient별 상태(status + error)를 한 객체로 묶어 setState 1회로 처리
  const [recipientStates, setRecipientStates] = useState<
    Record<number, RecipientUiState>
  >({});

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [customVariablesText, setCustomVariablesText] = useState(
    DEFAULT_CUSTOM_VARIABLES_TEXT,
  );
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  /** draftId → draft 로딩 (mock fallback 포함) */
  useEffect(() => {
    const applyMock = () => {
      const mockDraft = createMockDraft();
      setDraft(mockDraft);
      setIsMockMode(true);
      setRecipientStates(buildInitialRecipientStates(mockDraft.recipients));
    };

    if (!draftId) {
      if (canUseMockPreview()) applyMock();
      return;
    }

    const raw = readInvitationPreviewDraft(draftId);
    if (!raw) {
      if (canUseMockPreview()) applyMock();
      return;
    }

    try {
      const parsed = JSON.parse(raw) as InvitationPreviewDraft;
      setDraft(parsed);
      setIsMockMode(false);
      setRecipientStates(buildInitialRecipientStates(parsed.recipients));
    } catch {
      toast.error("초대 메일 미리보기 데이터를 읽지 못했습니다.");
    }
  }, [draftId]);

  /** 이메일 템플릿 목록 로딩 (취소 가능) */
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
        if (!cancelled) setIsLoadingTemplates(false);
      }
    };

    void loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  const sentCount = useMemo(
    () =>
      Object.values(recipientStates).filter(
        (state) => state.status === "sent",
      ).length,
    [recipientStates],
  );

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  /** 슬롯 요약은 N명 수신자 모두 동일 → 한 번만 계산 */
  const slotSummary = useMemo(
    () => (draft ? buildSlotSummary(draft.slots) : ""),
    [draft],
  );

  /** customVariablesText 파싱 결과를 메모이즈 (잘못된 JSON이면 null) */
  const extraVariables = useMemo(() => {
    try {
      return parseCustomVariables(customVariablesText);
    } catch {
      return null;
    }
  }, [customVariablesText]);

  /** 첫 번째 수신자 기준 미리보기 변수 */
  const templateVariablesPreview = useMemo(() => {
    if (!draft || draft.recipients.length === 0 || extraVariables === null) {
      return null;
    }
    return buildRecipientTemplateVariables(
      draft.recipients[0],
      draft,
      extraVariables,
      slotSummary,
    );
  }, [draft, extraVariables, slotSummary]);

  /* ─────── 핸들러: 자식 memo가 깨지지 않도록 useCallback ─────── */

  const handleUpdateRecipientField = useCallback<
    InvitationRecipientCardProps["onFieldChange"]
  >((candidateId, field, value) => {
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
  }, []);

  const handleCopyAllLinks = useCallback(async () => {
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
  }, [draft]);

  const handleCopySingleLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크를 복사했습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  }, []);

  const handleToggleEditing = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  /** 한 명에게 메일 발송 (내부 헬퍼) */
  const sendMailForRecipient = useCallback(
    async (recipient: InvitationRecipientDraft, mockMode: boolean) => {
      setRecipientStates((prev) => ({
        ...prev,
        [recipient.candidateId]: { status: "sending" },
      }));

      try {
        if (mockMode) {
          setRecipientStates((prev) => ({
            ...prev,
            [recipient.candidateId]: { status: "sent" },
          }));
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

        setRecipientStates((prev) => ({
          ...prev,
          [recipient.candidateId]: { status: "sent" },
        }));
      } catch (error) {
        setRecipientStates((prev) => ({
          ...prev,
          [recipient.candidateId]: {
            status: "failed",
            error: getApiErrorMessage(error, "메일 발송 실패"),
          },
        }));
      }
    },
    [],
  );

  const handleSendSingle = useCallback<InvitationRecipientCardProps["onSend"]>(
    async (candidateId) => {
      if (!draft) return;
      const recipient = draft.recipients.find(
        (item) => item.candidateId === candidateId,
      );
      if (!recipient) return;

      if (isMockMode) {
        await sendMailForRecipient(recipient, true);
        toast.success("mock 메일 발송 완료로 표시했습니다.");
        return;
      }

      await sendMailForRecipient(recipient, false);
    },
    [draft, isMockMode, sendMailForRecipient],
  );

  const handleSendAll = useCallback(async () => {
    if (!draft) return;

    /**
     * 순차 처리: 백엔드 메일 게이트웨이 부하·rate-limit를 고려해 sequential 유지.
     * 이미 발송된 항목은 건너뜀.
     */
    for (const recipient of draft.recipients) {
      if (recipientStates[recipient.candidateId]?.status === "sent") continue;
      await sendMailForRecipient(recipient, isMockMode);
    }
    toast.success("최종 메일 발송 처리가 완료되었습니다.");
  }, [draft, isMockMode, recipientStates, sendMailForRecipient]);

  const handleApplySelectedTemplate = useCallback(async () => {
    if (!draft) return;
    if (!selectedTemplateId) {
      toast.error("적용할 템플릿을 선택해주세요.");
      return;
    }
    if (extraVariables === null) {
      toast.error("추가 변수 JSON 형식을 확인해주세요.");
      return;
    }

    setIsApplyingTemplate(true);
    try {
      const renderedRecipients = await Promise.all(
        draft.recipients.map(async (recipient) => {
          const variables = buildRecipientTemplateVariables(
            recipient,
            draft,
            extraVariables,
            slotSummary,
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
        prev ? { ...prev, recipients: renderedRecipients } : prev,
      );
      toast.success("선택한 템플릿을 모든 수신자에게 적용했습니다.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "템플릿 적용 중 오류가 발생했습니다."),
      );
    } finally {
      setIsApplyingTemplate(false);
    }
  }, [draft, extraVariables, selectedTemplateId, slotSummary]);

  /* ───────────────────── Render ───────────────────── */

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
        <InvitationPreviewHeader
          recipientCount={draft.recipients.length}
          slotCount={draft.slotIds.length}
          sentCount={sentCount}
          isMockMode={isMockMode}
          isEditing={isEditing}
          onCopyAllLinks={handleCopyAllLinks}
          onToggleEditing={handleToggleEditing}
          onSendAll={handleSendAll}
        />

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <InvitationTemplateAssistPanel
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            isLoadingTemplates={isLoadingTemplates}
            isApplyingTemplate={isApplyingTemplate}
            customVariablesText={customVariablesText}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplateId}
            onChangeCustomVariables={setCustomVariablesText}
            onApplyTemplate={handleApplySelectedTemplate}
          />

          <InvitationVariablePreviewPanel
            variables={templateVariablesPreview}
          />
        </section>

        <InvitationSlotCandidatesPanel slots={draft.slots} />

        <InvitationFailureList failures={draft.failures} />

        <section className="space-y-4">
          {draft.recipients.map((recipient, index) => (
            <InvitationRecipientCard
              key={recipient.candidateId}
              recipient={recipient}
              index={index}
              isEditing={isEditing}
              state={
                recipientStates[recipient.candidateId] ?? { status: "idle" }
              }
              onCopyLink={handleCopySingleLink}
              onSend={handleSendSingle}
              onFieldChange={handleUpdateRecipientField}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
