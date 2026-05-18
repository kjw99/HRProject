import type { EmailTemplate, EmailTemplateRenderResponse } from "./emailTemplate";

/** 템플릿 편집 폼 상태 */
export interface EmailTemplateFormState {
  name: string;
  subject: string;
  body: string;
}

export interface EmailTemplateManagerClientProps {
  initialTemplates: EmailTemplate[];
}

export interface EmailTemplatePageHeroProps {
  templateCount: number;
}

export interface EmailTemplateListPanelProps {
  templates: EmailTemplate[];
  selectedTemplateId: number | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (templateId: number) => void;
  onCreateNew: () => void;
}

export interface EmailTemplateEditorPanelProps {
  isNew: boolean;
  form: EmailTemplateFormState;
  onFormChange: (patch: Partial<EmailTemplateFormState>) => void;
  isSaving: boolean;
  isDeleting: boolean;
  isRendering: boolean;
  canDelete: boolean;
  canPreview: boolean;
  onSave: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

export interface EmailTemplateVariablesPanelProps {
  placeholderKeys: readonly string[];
  variablesInput: string;
  onVariablesInputChange: (value: string) => void;
}

export interface EmailTemplatePreviewPanelProps {
  preview: EmailTemplateRenderResponse | null;
  isRendering: boolean;
}
