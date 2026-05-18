export type EmailTemplateVariableValue = string | number | boolean | null;

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
}

export interface EmailTemplateCreatePayload {
  name: string;
  subject: string;
  body: string;
}

export interface EmailTemplateUpdatePayload {
  name?: string;
  subject?: string;
  body?: string;
}

export interface EmailTemplateRenderPayload {
  variables?: Record<string, EmailTemplateVariableValue>;
}

export interface EmailTemplateRenderResponse {
  subject: string;
  body: string;
}

export interface EmailTemplateMutationResponse {
  message: string;
}
