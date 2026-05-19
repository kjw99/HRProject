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
  const openMailPreviewPopup = () => {
    const popup = window.open(
      "",
      "interviewer-mail-preview",
      "width=980,height=760,left=140,top=90",
    );
    if (!popup) {
      toast.error("브라우저 팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.");
      return;
    }

    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    popup.document.write(`<!doctype html>
<html lang="ko">
<head><meta charset="utf-8" /><title>면접관 메일 미리보기</title>
<style>
body{font-family:Pretendard,sans-serif;margin:0;background:#f8fafc;color:#0f172a}
.wrap{max-width:860px;margin:24px auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px}
h1{margin:0 0 12px;font-size:20px}.meta{font-size:13px;color:#475569;margin-bottom:12px}
.subject{font-weight:700;margin:8px 0 12px}
pre{white-space:pre-wrap;word-break:break-word;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;font-size:14px;line-height:1.5}
</style></head>
<body><div class="wrap">
<h1>면접관 메일 미리보기</h1>
<div class="meta">수신자: ${escapeHtml(interviewer.interviewerEmail)}</div>
<div class="meta">초대 링크: ${escapeHtml(inviteUrl ?? "(발송 시 생성/반영)")}</div>
<div class="subject">제목: ${escapeHtml(subject)}</div>
<pre>${escapeHtml(content)}</pre>
</div></body></html>`);
    popup.document.close();
    popup.focus();
  };

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
            getApiErrorMessage(error, "?대찓???쒗뵆由우쓣 遺덈윭?ㅼ? 紐삵뻽?듬땲??"),
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
          ? "(비어 있음)"
          : String(raw).startsWith("{")
            ? "(미할당)"
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
    toast.success(`{${key}} (${label})??媛믪쓣 諛섏쁺?덉뒿?덈떎.`);
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
    toast.success(`{${key}} 諛?愿??蹂?섎? 諛섏쁺?덉뒿?덈떎.`);
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
        "?먮룞?쇰줈 梨꾩슱 ???덈뒗 蹂?섍? ?놁뒿?덈떎. 蹂?섎? ?대┃??吏곸젒 ?낅젰??二쇱꽭??",
      );
      return;
    }

    setCustomVariablesText(nextJson);
    toast.success(`${filled}媛?蹂?섎? ?먮룞?쇰줈 梨꾩썱?듬땲??`);
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
            ? "湲곗〈 珥덈? 留곹겕媛 諛섏쁺???쒗뵆由?珥덉븞??遺덈윭?붿뒿?덈떎."
            : "珥덈? 留곹겕媛 諛섏쁺???쒗뵆由?珥덉븞??遺덈윭?붿뒿?덈떎.",
        );
      })
      .catch((error) => {
        toast.error(
          getApiErrorMessage(error, "硫붿씪 ?쒗뵆由??곸슜 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎."),
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
      toast.error("?곸슜???쒗뵆由우쓣 ?좏깮?댁＜?몄슂.");
      return;
    }

    if (missingTemplateKeys.length > 0) {
      toast.error(
        `?쒗뵆由우뿉 ?꾩슂??蹂?섍? 鍮꾩뼱 ?덉뒿?덈떎: ${missingTemplateKeys.map((k) => `{${k}}`).join(", ")}. JSON??媛믪쓣 ?ｌ뼱二쇱꽭??`,
      );
      return;
    }

    setIsApplyingTemplate(true);
    try {
      await applyTemplateWithVariables();
      toast.success("?쒗뵆由우쓣 硫붿씪 珥덉븞??諛섏쁺?덉뒿?덈떎.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "硫붿씪 ?쒗뵆由??곸슜 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎."),
      );
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("硫붿씪 ?쒕ぉ怨?蹂몃Ц???낅젰?댁＜?몄슂.");
      return;
    }

    openMailPreviewPopup();
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
        getApiErrorMessage(error, "硫댁젒愿 硫붿씪 諛쒖넚 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎."),
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
      subtitle={`${interviewer.interviewerName} 쨌 ${interviewer.interviewerEmail}`}
      eyebrow="Interviewer Mail"
      eyebrowIcon="envelope"
      theme="indigo"
      size="xl"
      footer={
        <HrModalFooter
          actions={[
            {
              label: "?リ린",
              onClick: onClose,
              variant: "secondary",
              disabled: isSending,
            },
            {
              label: "硫붿씪 諛쒖넚",
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


