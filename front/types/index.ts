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
  EmailTemplateFormState,
  EmailTemplateManagerClientProps,
  EmailTemplatePageHeroProps,
  EmailTemplateListPanelProps,
  EmailTemplateEditorPanelProps,
  EmailTemplateVariablesPanelProps,
  EmailTemplatePreviewPanelProps,
} from "./email-template-ui";
export type {
  BoxIconName,
  HrPageHeroTheme,
  HrQuickLink,
  HrStatItem,
  HrPageHeroProps,
  HrModalSize,
  HrModalTheme,
  HrModalProps,
  HrModalActionVariant,
  HrModalAction,
  HrModalFooterProps,
  HrSidebarMenuItem,
  HrSidebarMenuGroup,
  BookingInviteStatus,
  HrStatusBadgeTone,
  HrStatusBadgeProps,
  HrInfoSectionProps,
  HrSuccessBannerProps,
  CriteriaFilter,
} from "./hr-ui";
export type {
  AdminOperationalMetric,
  AdminQuickActionCard,
  AdminHomeOverviewProps,
  AdminHomeMetricsProps,
} from "./admin-ui";
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
