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

export const extractEmailTemplateKeys = (
  template: { subject: string; body: string },
): string[] => {
  const matches =
    `${template.subject}\n${template.body}`.match(/\{([a-zA-Z0-9_]+)\}/g) ?? [];
  return Array.from(new Set(matches.map((item) => item.slice(1, -1))));
};
