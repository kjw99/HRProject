import type { Applicant } from "@/types/applicant";
import type { HrInterviewer } from "@/types/interviewer";
import { parseTemplateVariablesJson } from "./template-variables";

export const INTERVIEWER_MAIL_DEFAULT_EXTRA = {
  company_name: "ILJIN",
  sender_name: "HR Team",
} as const;

/** 면접관 메일 템플릿 치환용 변수 맵 생성 */
export function buildInterviewerMailVariables(params: {
  interviewer: HrInterviewer;
  applicant?: Applicant | null;
  inviteUrl?: string | null;
  customVariablesText: string;
}): Record<string, string | number> {
  const { interviewer, applicant, inviteUrl, customVariablesText } = params;

  let extra: Record<string, string | number | boolean | null> = {};
  try {
    if (customVariablesText.trim()) {
      extra = parseTemplateVariablesJson(customVariablesText);
    }
  } catch {
    extra = {};
  }

  const interviewerVars = {
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
    invite_url: inviteUrl ?? "{invite_url}",
    access_link: inviteUrl ?? "{invite_url}",
    invitation_url: inviteUrl ?? "{invitation_url}",
  };

  const result: Record<string, string | number> = {
    ...interviewerVars,
    ...extra,
  };

  if (applicant) {
    Object.assign(result, {
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
      invitation_url: inviteUrl ?? "{invitation_url}",
    });
  }

  return result;
}

export function buildInterviewerMailVariablePreviewItems(params: {
  interviewer: HrInterviewer;
  applicant?: Applicant | null;
  inviteUrl?: string | null;
  vars: Record<string, string | number>;
}): Array<{ key: string; value: string; description?: string }> {
  const { interviewer, applicant, inviteUrl, vars } = params;

  const items = [
    {
      key: "interviewer_name",
      value: String(vars.interviewer_name ?? ""),
      description: "면접관 이름 (자동)",
    },
    {
      key: "interviewer_email",
      value: String(vars.interviewer_email ?? ""),
      description: "면접관 이메일 (자동)",
    },
    {
      key: "position_name",
      value: String(vars.position_name ?? interviewer.positionName ?? ""),
      description: "직무 (자동)",
    },
    {
      key: "invite_url",
      value: inviteUrl ? String(inviteUrl) : "(발송·생성 시 치환)",
      description: "면접관 초대 링크",
    },
    {
      key: "invitation_url",
      value: inviteUrl
        ? String(inviteUrl)
        : String(vars.invitation_url ?? "(발송·생성 시 치환)"),
      description: "초대·면접 예약 링크",
    },
  ];

  if (applicant) {
    items.push(
      {
        key: "candidate_name",
        value: String(vars.candidate_name ?? applicant.name),
        description: "선택한 지원자 이름",
      },
      {
        key: "candidate_email",
        value: String(vars.candidate_email ?? applicant.email ?? ""),
        description: "선택한 지원자 이메일",
      },
      {
        key: "phone",
        value: String(vars.phone ?? applicant.phone),
        description: "선택한 지원자 연락처",
      },
    );
  }

  return items;
}
