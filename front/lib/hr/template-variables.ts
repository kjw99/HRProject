import type { Applicant } from "@/types/applicant";
import type { EmailTemplateVariableValue } from "@/types/emailTemplate";

export type TemplateVariablesMap = Record<string, EmailTemplateVariableValue>;

export const parseTemplateVariablesJson = (
  value: string,
): TemplateVariablesMap => {
  if (!value.trim()) return {};

  const parsed = JSON.parse(value) as TemplateVariablesMap;

  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("변수는 JSON 객체 형태여야 합니다.");
  }

  return parsed;
};

/** 초대 링크를 변수 JSON·맵에 병합 (메일 작성 시 자동 입력용) */
/** 지원자 정보를 변수 JSON에 병합 (면접관 메일에서 candidate_* 사용 시) */
export const mergeApplicantIntoVariablesJson = (
  jsonText: string,
  applicant: Applicant,
): string => {
  let base: TemplateVariablesMap = {};
  try {
    if (jsonText.trim()) {
      base = parseTemplateVariablesJson(jsonText);
    }
  } catch {
    base = {};
  }

  return JSON.stringify(
    {
      ...base,
      candidate_id: applicant.candidate_id,
      candidateId: applicant.candidate_id,
      candidate_name: applicant.name,
      candidateName: applicant.name,
      candidate_email: applicant.email ?? "",
      candidateEmail: applicant.email ?? "",
      position_id: applicant.position_id,
      positionId: applicant.position_id,
      phone: applicant.phone,
      date_of_birth: applicant.date_of_birth,
    },
    null,
    2,
  );
};

export const mergeInviteUrlIntoVariablesJson = (
  jsonText: string,
  inviteUrl: string,
): string => {
  let base: TemplateVariablesMap = {};
  try {
    if (jsonText.trim()) {
      base = parseTemplateVariablesJson(jsonText);
    }
  } catch {
    base = {};
  }

  return JSON.stringify(
    {
      ...base,
      invite_url: inviteUrl,
      access_link: inviteUrl,
      invitation_url: inviteUrl,
    },
    null,
    2,
  );
};

/** 단일 템플릿 변수를 JSON에 병합 (관련 alias 키도 함께 갱신) */
export const mergeVariableIntoVariablesJson = (
  jsonText: string,
  key: string,
  value: string | number,
): string => {
  let base: TemplateVariablesMap = {};
  try {
    if (jsonText.trim()) {
      base = parseTemplateVariablesJson(jsonText);
    }
  } catch {
    base = {};
  }

  const patch: TemplateVariablesMap = { [key]: value };

  const linkKeys = new Set([
    "invite_url",
    "access_link",
    "invitation_url",
  ]);
  if (linkKeys.has(key)) {
    for (const linkKey of linkKeys) {
      patch[linkKey] = value;
    }
  }

  if (key === "candidate_name") patch.candidateName = value;
  if (key === "candidateName") patch.candidate_name = value;
  if (key === "candidate_email") patch.candidateEmail = value;
  if (key === "candidateEmail") patch.candidate_email = value;

  return JSON.stringify({ ...base, ...patch }, null, 2);
};

export const extractEmailTemplateKeys = (
  template: { subject: string; body: string },
): string[] => {
  const matches =
    `${template.subject}\n${template.body}`.match(/\{([a-zA-Z0-9_]+)\}/g) ?? [];
  return Array.from(new Set(matches.map((item) => item.slice(1, -1))));
};
