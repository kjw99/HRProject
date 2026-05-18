import "server-only";

import {
  EmailTemplate,
  EmailTemplateCreatePayload,
  EmailTemplateMutationResponse,
  EmailTemplateRenderPayload,
  EmailTemplateRenderResponse,
  EmailTemplateUpdatePayload,
} from "@/types/emailTemplate";
import { apiServer } from "../axios-server";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const fetchEmailTemplatesServer = async (): Promise<EmailTemplate[]> => {
  try {
    const response = await apiServer.get<EmailTemplate[]>("/api/email-templates");
    return response.data;
  } catch (error: unknown) {
    console.warn(
      "[Server API] email template list load failed. Returning empty list.",
      getErrorMessage(error),
    );
    return [];
  }
};

export const fetchEmailTemplateServer = async (
  templateId: number,
): Promise<EmailTemplate | null> => {
  try {
    const response = await apiServer.get<EmailTemplate>(
      `/api/email-templates/${templateId}`,
    );
    return response.data;
  } catch (error: unknown) {
    console.warn(
      "[Server API] email template detail load failed.",
      templateId,
      getErrorMessage(error),
    );
    return null;
  }
};

export const createEmailTemplateServer = async (
  data: EmailTemplateCreatePayload,
): Promise<EmailTemplate> => {
  const response = await apiServer.post<EmailTemplate>("/api/email-templates", data);
  return response.data;
};

export const updateEmailTemplateServer = async (
  templateId: number,
  data: EmailTemplateUpdatePayload,
): Promise<EmailTemplate> => {
  const response = await apiServer.patch<EmailTemplate>(
    `/api/email-templates/${templateId}`,
    data,
  );
  return response.data;
};

export const deleteEmailTemplateServer = async (
  templateId: number,
): Promise<EmailTemplateMutationResponse> => {
  const response = await apiServer.delete<EmailTemplateMutationResponse>(
    `/api/email-templates/${templateId}`,
  );
  return response.data;
};

export const renderEmailTemplateServer = async (
  templateId: number,
  data: EmailTemplateRenderPayload,
): Promise<EmailTemplateRenderResponse> => {
  const response = await apiServer.post<EmailTemplateRenderResponse>(
    `/api/email-templates/${templateId}/render`,
    {
      variables: data.variables ?? {},
    },
  );
  return response.data;
};
