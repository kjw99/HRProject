import type { AvailableInterviewSlot } from "@/types/interviewBooking";
import type { EmailTemplateVariableValue } from "@/types/emailTemplate";

export interface InvitationRecipientDraft {
  candidateId: number;
  name: string;
  email: string | null;
  invitationUrl: string;
  subject: string;
  content: string;
}

export interface InvitationFailureDraft {
  candidateId: number;
  name: string;
  email?: string | null;
  error?: string;
}

export interface InvitationPreviewDraft {
  createdAt: string;
  slotIds: number[];
  slots: AvailableInterviewSlot[];
  recipients: InvitationRecipientDraft[];
  failures: InvitationFailureDraft[];
}

export type InvitationSendStatus = "idle" | "sending" | "sent" | "failed";

export type TemplateVariablesMap = Record<string, EmailTemplateVariableValue>;
