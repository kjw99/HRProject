"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import HrModal from "@/components/hr/shared/HrModal";
import HrModalFooter from "@/components/hr/shared/HrModalFooter";
import InterviewerMailComposerModalBody from "./InterviewerMailComposerModalBody";
import { emailTemplateApi } from "@/lib/hr/email-templates.client";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import { interviewerMailApi } from "@/lib/hr/interviewer-mail.client";
import {
  buildInterviewerMailVariables,
  INTERVIEWER_MAIL_DEFAULT_EXTRA,
} from "@/lib/hr/interviewer-mail-variables";
import {
  extractEmailTemplateKeys,
  mergeInviteUrlIntoVariablesJson,
  mergeVariableIntoVariablesJson,
} from "@/lib/hr/template-variables";
import {
  getMailTemplateVariableMeta,
  resolveMailVariableAutoValue,
} from "@/lib/hr/mail-template-variable-meta";
import type { InterviewerMailComposerModalProps } from "@/types/interviewer";

export default function InterviewerMailComposerModal({
  isOpen,
  onClose,
  interviewer,
  initialInviteUrl = null,
  initialExpiresInDays = 7,
  inviteReused = false,
  allInterviewers = [],
}: InterviewerMailComposerModalProps) {
  const autoAppliedTemplateRef = useRef(false);
  const [templates, setTemplates] = useState<
    Awaited<ReturnType<typeof emailTemplateApi.fetchEmailTemplates>>
  >([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [customVariablesText, setCustomVariablesText] = useState(
    JSON.stringify(INTERVIEWER_MAIL_DEFAULT_EXTRA, null, 2),
  );
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(initialExpiresInDays);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [mailSent, setMailSent] = useState(false);
  const [assigningVariableKey, setAssigningVariableKey] = useState<string | null>(
    null,
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
    if (!isOpen) {
      autoAppliedTemplateRef.current = false;
      setMailSent(false);
      return;
    }

    setSubject("");
    setContent("");
    setMailSent(false);
    setExpiresInDays(initialExpiresInDays);

    if (initialInviteUrl) {
      setInviteUrl(initialInviteUrl);
      setCustomVariablesText((prev) =>
        mergeInviteUrlIntoVariablesJson(prev, initialInviteUrl),
      );
    } else {
      setInviteUrl(null);
      setCustomVariablesText(
        JSON.stringify(INTERVIEWER_MAIL_DEFAULT_EXTRA, null, 2),
      );
    }
  }, [interviewer, isOpen, initialInviteUrl, initialExpiresInDays]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  const templateKeys = useMemo(
    () => (selectedTemplate ? extractEmailTemplateKeys(selectedTemplate) : []),
    [selectedTemplate],
  );

  const buildVariables = () => {
    if (!interviewer) return {};
    return buildInterviewerMailVariables({
      interviewer,
      inviteUrl,
      customVariablesText,
    });
  };

  const resolvedVariables = useMemo(() => {
    if (!interviewer) return {};
    return buildInterviewerMailVariables({
      interviewer,
      inviteUrl,
      customVariablesText,
    });
  }, [interviewer, inviteUrl, customVariablesText]);

  const variablePreviewItems = useMemo(() => {
    if (!interviewer) return [];
    return templateKeys.map((key) => {
      const raw = resolvedVariables[key];
      const value =
        raw === undefined || raw === null
          ? "—"
          : String(raw).startsWith("{")
            ? "—"
            : String(raw);
      return {
        key,
        value,
        description: getMailTemplateVariableMeta(key).label,
      };
    });
  }, [interviewer, templateKeys, resolvedVariables]);

  const missingTemplateKeys = useMemo(() => {
    if (!templateKeys.length || !interviewer) return [];
    return templateKeys.filter((key) => {
      const value = resolvedVariables[key];
      return (
        value === undefined ||
        value === null ||
        value === "" ||
        String(value).startsWith("{")
      );
    });
  }, [templateKeys, interviewer, resolvedVariables]);

  const handleAssignVariable = (key: string, value: string) => {
    setCustomVariablesText((prev) =>
      mergeVariableIntoVariablesJson(prev, key, value),
    );
    const label = getMailTemplateVariableMeta(key).label;
    toast.success(`{${key}} (${label})에 값을 반영했습니다.`);
  };

  const handleAssignVariableWithExtras = (
    key: string,
    value: string,
    extras: Record<string, string>,
  ) => {
    setCustomVariablesText((prev) => {
      let next = mergeVariableIntoVariablesJson(prev, key, value);
      for (const [extraKey, extraValue] of Object.entries(extras)) {
        if (extraValue.trim()) {
          next = mergeVariableIntoVariablesJson(next, extraKey, extraValue);
        }
      }
      return next;
    });
    toast.success(`{${key}} 및 관련 변수를 반영했습니다.`);
  };

  const handleFillAllMissingVariables = () => {
    if (!interviewer || missingTemplateKeys.length === 0) return;

    let nextJson = customVariablesText;
    let filled = 0;

    for (const key of missingTemplateKeys) {
      const meta = getMailTemplateVariableMeta(key);
      if (!meta.autoSource) continue;

      const autoValue = resolveMailVariableAutoValue(meta.autoSource, {
        inviteUrl,
        interviewer,
      });
      if (!autoValue?.trim()) continue;

      nextJson = mergeVariableIntoVariablesJson(nextJson, key, autoValue);
      filled += 1;
    }

    if (filled === 0) {
      toast.error(
        "자동으로 채울 수 있는 변수가 없습니다. 변수를 클릭해 직접 입력해 주세요.",
      );
      return;
    }

    setCustomVariablesText(nextJson);
    toast.success(`${filled}개 변수를 자동으로 채웠습니다.`);
  };

  const applyTemplateWithVariables = async () => {
    if (!selectedTemplateId || !interviewer) return;

    const rendered = await emailTemplateApi.renderEmailTemplate(
      selectedTemplateId,
      { variables: buildVariables() },
    );
    setSubject(rendered.subject);
    setContent(rendered.body);
  };

  useEffect(() => {
    if (
      !isOpen ||
      !initialInviteUrl ||
      !selectedTemplateId ||
      isLoadingTemplates ||
      autoAppliedTemplateRef.current ||
      !interviewer
    ) {
      return;
    }

    autoAppliedTemplateRef.current = true;
    setIsApplyingTemplate(true);
    void applyTemplateWithVariables()
      .then(() => {
        toast.success(
          inviteReused
            ? "기존 초대 링크가 반영된 템플릿 초안을 불러왔습니다."
            : "초대 링크가 반영된 템플릿 초안을 불러왔습니다.",
        );
      })
      .catch((error) => {
        toast.error(
          getApiErrorMessage(error, "메일 템플릿 적용 중 오류가 발생했습니다."),
        );
      })
      .finally(() => {
        setIsApplyingTemplate(false);
      });
  }, [
    isOpen,
    initialInviteUrl,
    selectedTemplateId,
    isLoadingTemplates,
    interviewer,
    inviteReused,
  ]);

  if (!interviewer) return null;

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error("적용할 템플릿을 선택해주세요.");
      return;
    }

    if (missingTemplateKeys.length > 0) {
      toast.error(
        `템플릿에 필요한 변수가 비어 있습니다: ${missingTemplateKeys.map((k) => `{${k}}`).join(", ")}. JSON에 값을 넣어주세요.`,
      );
      return;
    }

    setIsApplyingTemplate(true);
    try {
      await applyTemplateWithVariables();
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
      setInviteUrl(response.inviteUrl ?? inviteUrl);
      setMailSent(true);
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
        <HrModalFooter
          actions={[
            {
              label: "닫기",
              onClick: onClose,
              variant: "secondary",
              disabled: isSending,
            },
            {
              label: "메일 발송",
              onClick: () => void handleSend(),
              icon: "send",
              variant: "primary",
              disabled: isSending,
              loading: isSending,
            },
          ]}
        />
      }
    >
      <InterviewerMailComposerModalBody
        inviteUrl={inviteUrl}
        mailSent={mailSent}
        inviteReused={inviteReused}
        isLoadingTemplates={isLoadingTemplates}
        isApplyingTemplate={isApplyingTemplate}
        selectedTemplateId={selectedTemplateId}
        expiresInDays={expiresInDays}
        customVariablesText={customVariablesText}
        subject={subject}
        content={content}
        templates={templates}
        selectedTemplate={selectedTemplate}
        templateKeys={templateKeys}
        missingTemplateKeys={missingTemplateKeys}
        variablePreviewItems={variablePreviewItems}
        resolvedVariables={resolvedVariables}
        assigningVariableKey={assigningVariableKey}
        onSelectVariableKey={setAssigningVariableKey}
        onCloseVariableAssign={() => setAssigningVariableKey(null)}
        onAssignVariable={handleAssignVariable}
        onFillAllMissingVariables={handleFillAllMissingVariables}
        interviewer={interviewer}
        allInterviewers={allInterviewers}
        onAssignVariableWithExtras={handleAssignVariableWithExtras}
        onTemplateChange={setSelectedTemplateId}
        onExpiresChange={setExpiresInDays}
        onCustomVariablesChange={setCustomVariablesText}
        onSubjectChange={setSubject}
        onContentChange={setContent}
        onApplyTemplate={() => void handleApplyTemplate()}
      />
    </HrModal>
  );
}
