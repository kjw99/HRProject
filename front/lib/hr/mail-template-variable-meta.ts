import type { HrInterviewer } from "@/types/interviewer";

export type MailVariableAutoSource =
  | "invite_url"
  | "interviewer_name"
  | "interviewer_email"
  | "position_name"
  | "interview_round";

export interface MailTemplateVariableMeta {
  label: string;
  placeholder: string;
  autoSource?: MailVariableAutoSource;
  /** 같은 값으로 함께 갱신할 키 */
  aliasKeys?: string[];
}

const INVITE_ALIAS_KEYS = [
  "invite_url",
  "access_link",
  "invitation_url",
] as const;

export const MAIL_TEMPLATE_VARIABLE_META: Record<string, MailTemplateVariableMeta> =
  {
    candidate_name: {
      label: "이름 (면접관 목록에서 선택)",
      placeholder: "이름 또는 직무로 검색",
    },
    candidateName: {
      label: "이름 (면접관 목록에서 선택)",
      placeholder: "이름 또는 직무로 검색",
    },
    candidate_email: {
      label: "이메일 (면접관 목록에서 선택)",
      placeholder: "이름·이메일로 검색",
    },
    candidateEmail: {
      label: "이메일 (면접관 목록에서 선택)",
      placeholder: "이름·이메일로 검색",
    },
    invitation_url: {
      label: "초대·면접 링크",
      placeholder: "https://...",
      autoSource: "invite_url",
      aliasKeys: [...INVITE_ALIAS_KEYS],
    },
    invite_url: {
      label: "면접관 초대 링크",
      placeholder: "https://...",
      autoSource: "invite_url",
      aliasKeys: [...INVITE_ALIAS_KEYS],
    },
    access_link: {
      label: "접속 링크",
      placeholder: "https://...",
      autoSource: "invite_url",
      aliasKeys: [...INVITE_ALIAS_KEYS],
    },
    interviewer_name: {
      label: "면접관 이름",
      placeholder: "",
      autoSource: "interviewer_name",
    },
    interviewerName: {
      label: "면접관 이름",
      autoSource: "interviewer_name",
      placeholder: "",
    },
    interviewer_email: {
      label: "면접관 이메일",
      autoSource: "interviewer_email",
      placeholder: "",
    },
    interviewerEmail: {
      label: "면접관 이메일",
      autoSource: "interviewer_email",
      placeholder: "",
    },
    position_name: {
      label: "직무",
      autoSource: "position_name",
      placeholder: "",
    },
    positionName: {
      label: "직무",
      autoSource: "position_name",
      placeholder: "",
    },
    interview_round: {
      label: "면접 차수",
      autoSource: "interview_round",
      placeholder: "",
    },
    interviewRound: {
      label: "면접 차수",
      autoSource: "interview_round",
      placeholder: "",
    },
    company_name: {
      label: "회사명",
      placeholder: "예: ILJIN",
    },
    sender_name: {
      label: "발신자 표시명",
      placeholder: "예: HR Team",
    },
  };

const CANDIDATE_NAME_KEYS = new Set(["candidate_name", "candidateName"]);
const CANDIDATE_EMAIL_KEYS = new Set(["candidate_email", "candidateEmail"]);

export function isInterviewerPickerVariableKey(key: string): boolean {
  return CANDIDATE_NAME_KEYS.has(key) || CANDIDATE_EMAIL_KEYS.has(key);
}

export function getInterviewerPickerValueMode(
  key: string,
): "name" | "email" | null {
  if (CANDIDATE_EMAIL_KEYS.has(key)) return "email";
  if (CANDIDATE_NAME_KEYS.has(key)) return "name";
  return null;
}

export function getMailTemplateVariableMeta(
  key: string,
): MailTemplateVariableMeta {
  return (
    MAIL_TEMPLATE_VARIABLE_META[key] ?? {
      label: key,
      placeholder: "값을 입력하세요",
    }
  );
}

export function resolveMailVariableAutoValue(
  source: MailVariableAutoSource,
  ctx: { inviteUrl: string | null; interviewer: HrInterviewer },
): string | null {
  switch (source) {
    case "invite_url":
      return ctx.inviteUrl;
    case "interviewer_name":
      return ctx.interviewer.interviewerName;
    case "interviewer_email":
      return ctx.interviewer.interviewerEmail;
    case "position_name":
      return ctx.interviewer.positionName ?? "";
    case "interview_round":
      return ctx.interviewer.interviewRound ?? "";
    default:
      return null;
  }
}
