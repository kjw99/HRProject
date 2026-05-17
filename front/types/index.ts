export type {
  SignUpRequest,
  LoginRequest,
  UserInfo,
  AuthResponse,
} from "./auth";
export type {
  EmailTemplateVariableValue,
  EmailTemplate,
  EmailTemplateCreatePayload,
  EmailTemplateUpdatePayload,
  EmailTemplateRenderPayload,
  EmailTemplateRenderResponse,
  EmailTemplateMutationResponse,
} from "./emailTemplate";
export type {
  BoxIconName,
  HrPageHeroTheme,
  HrQuickLink,
  HrStatItem,
  HrPageHeroProps,
  HrModalSize,
  HrModalTheme,
  HrModalProps,
  CriteriaFilter,
} from "./hr-ui";
export type {
  InvitationRecipientDraft,
  InvitationFailureDraft,
  InvitationPreviewDraft,
  InvitationSendStatus,
  TemplateVariablesMap,
} from "./invitationPreview";

export interface PageStatus {
  path: string;
  isActive: boolean;
  message?: string;
}
