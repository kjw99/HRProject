"use client";

import { useEffect, useMemo, useState } from "react";
import HrModal from "@/components/hr/shared/HrModal";
import HrModalFooter from "@/components/hr/shared/HrModalFooter";
import {
  getMailTemplateVariableMeta,
  resolveMailVariableAutoValue,
} from "@/lib/hr/mail-template-variable-meta";
import {
  getInterviewerPickerValueMode,
  isInterviewerPickerVariableKey,
} from "@/lib/hr/mail-template-variable-meta";
import type { HrInterviewer } from "@/types/interviewer";
import { MAIL_COMPOSER, MailComposerInput } from "./mail-composer-ui";
import MailTemplatePersonPicker, {
  buildInterviewerPickerOptions,
  type MailTemplatePersonOption,
} from "./MailTemplatePersonPicker";

export interface MailTemplateVariableAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  variableKey: string | null;
  currentValue: string;
  inviteUrl: string | null;
  interviewer: HrInterviewer;
  allInterviewers: readonly HrInterviewer[];
  onSave: (key: string, value: string) => void;
  onSaveWithExtras?: (
    key: string,
    value: string,
    extras: Record<string, string>,
  ) => void;
}

export default function MailTemplateVariableAssignModal({
  isOpen,
  onClose,
  variableKey,
  currentValue,
  inviteUrl,
  interviewer,
  allInterviewers,
  onSave,
  onSaveWithExtras,
}: MailTemplateVariableAssignModalProps) {
  const meta = variableKey
    ? getMailTemplateVariableMeta(variableKey)
    : null;

  const suggestedAutoValue = useMemo(() => {
    if (!meta?.autoSource) return null;
    return resolveMailVariableAutoValue(meta.autoSource, {
      inviteUrl,
      interviewer,
    });
  }, [meta?.autoSource, inviteUrl, interviewer]);

  const [draft, setDraft] = useState(currentValue);
  const [pickerExtras, setPickerExtras] = useState<Record<string, string>>({});

  const pickerMode = variableKey
    ? getInterviewerPickerValueMode(variableKey)
    : null;
  const personOptions = useMemo(
    () => buildInterviewerPickerOptions(allInterviewers),
    [allInterviewers],
  );

  useEffect(() => {
    if (!isOpen || !variableKey) return;
    setDraft(
      currentValue && !currentValue.startsWith("{")
        ? currentValue
        : (suggestedAutoValue ?? ""),
    );
    setPickerExtras({});
  }, [isOpen, variableKey, currentValue, suggestedAutoValue]);

  if (!variableKey || !meta) return null;

  const canAutoFill = Boolean(
    suggestedAutoValue && suggestedAutoValue.trim().length > 0,
  );

  const handlePersonSelect = (option: MailTemplatePersonOption) => {
    if (pickerMode === "name") {
      setPickerExtras({
        candidate_email: option.email,
        candidateEmail: option.email,
      });
    } else if (pickerMode === "email") {
      setPickerExtras({
        candidate_name: option.name,
        candidateName: option.name,
      });
    }
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (Object.keys(pickerExtras).length > 0 && onSaveWithExtras) {
      onSaveWithExtras(variableKey, trimmed, pickerExtras);
    } else {
      onSave(variableKey, trimmed);
    }
    onClose();
  };

  return (
    <HrModal
      isOpen={isOpen}
      onClose={onClose}
      title={`{${variableKey}} 값 설정`}
      subtitle={meta.label}
      eyebrow="Template Variable"
      eyebrowIcon="edit-alt"
      theme="indigo"
      size="md"
      zIndex={125}
      footer={
        <HrModalFooter
          actions={[
            { label: "취소", onClick: onClose, variant: "secondary" },
            {
              label: "변수에 적용",
              onClick: handleSave,
              icon: "check",
              variant: "primary",
              disabled: !draft.trim(),
            },
          ]}
        />
      }
    >
      <div className="space-y-4 p-5 sm:p-6">
        <p className="text-sm font-semibold leading-6 text-slate-600">
          입력한 값은 <strong className="font-black text-slate-800">추가 변수 JSON</strong>
          에 저장되며, 「템플릿 적용」 시 메일 제목·본문에 반영됩니다.
        </p>

        {canAutoFill ? (
          <button
            type="button"
            onClick={() => setDraft(suggestedAutoValue ?? "")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            <i className="bx bx-magic-wand text-lg" />
            {meta.autoSource === "invite_url"
              ? "현재 초대 링크로 자동 채우기"
              : "면접관 정보로 자동 채우기"}
          </button>
        ) : null}

        <label className="grid gap-1.5">
          <span className={MAIL_COMPOSER.label}>{meta.label}</span>
          {variableKey && isInterviewerPickerVariableKey(variableKey) && pickerMode ? (
            <MailTemplatePersonPicker
              value={draft}
              onChange={setDraft}
              onSelectOption={handlePersonSelect}
              options={personOptions}
              valueMode={pickerMode}
              placeholder={meta.placeholder}
            />
          ) : (
            <MailComposerInput
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={meta.placeholder}
              autoFocus
            />
          )}
        </label>

        {meta.autoSource === "invite_url" && !inviteUrl ? (
          <p className={MAIL_COMPOSER.alert}>
            초대 링크가 아직 없습니다. 메일 보내기를 시작할 때 링크가 생성되면
            자동 채우기를 사용할 수 있습니다.
          </p>
        ) : null}
      </div>
    </HrModal>
  );
}
