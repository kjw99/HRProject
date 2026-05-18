"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { emailTemplateApi } from "@/lib/hr/email-templates.client";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import {
  extractEmailTemplateKeys,
  parseTemplateVariablesJson,
} from "@/lib/hr/template-variables";
import type { EmailTemplate, EmailTemplateRenderResponse } from "@/types/emailTemplate";
import type {
  EmailTemplateFormState,
  EmailTemplateManagerClientProps,
} from "@/types/email-template-ui";
import {
  EMAIL_TEMPLATE_DEFAULT_VARIABLES,
  EMAIL_TEMPLATE_MESSAGES,
  EMPTY_EMAIL_TEMPLATE_FORM,
} from "./email-template.constants";

export function useEmailTemplateManager({
  initialTemplates,
}: EmailTemplateManagerClientProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    initialTemplates[0]?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<EmailTemplateFormState>(
    EMPTY_EMAIL_TEMPLATE_FORM,
  );
  const [variablesInput, setVariablesInput] = useState(() =>
    JSON.stringify(EMAIL_TEMPLATE_DEFAULT_VARIABLES, null, 2),
  );
  const [preview, setPreview] = useState<EmailTemplateRenderResponse | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTemplates = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return templates;

    return templates.filter((template) =>
      [template.name, template.subject, template.body]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [searchQuery, templates]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  const placeholderKeys = useMemo(
    () =>
      selectedTemplate ? extractEmailTemplateKeys(selectedTemplate) : [],
    [selectedTemplate],
  );

  const isNewTemplate = selectedTemplateId === null;

  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  useEffect(() => {
    if (!selectedTemplate) {
      setForm(EMPTY_EMAIL_TEMPLATE_FORM);
      setPreview(null);
      return;
    }

    setForm({
      name: selectedTemplate.name,
      subject: selectedTemplate.subject,
      body: selectedTemplate.body,
    });
    setPreview(null);
  }, [selectedTemplate]);

  const handleFormChange = useCallback((patch: Partial<EmailTemplateFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleNewTemplate = useCallback(() => {
    setSelectedTemplateId(null);
    setForm(EMPTY_EMAIL_TEMPLATE_FORM);
    setPreview(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error(EMAIL_TEMPLATE_MESSAGES.validationRequired);
      return;
    }

    setIsSaving(true);
    try {
      if (selectedTemplateId === null) {
        const created = await emailTemplateApi.createEmailTemplate({
          name: form.name.trim(),
          subject: form.subject.trim(),
          body: form.body,
        });
        setTemplates((prev) => [created, ...prev]);
        setSelectedTemplateId(created.id);
        toast.success(EMAIL_TEMPLATE_MESSAGES.created);
      } else {
        const updated = await emailTemplateApi.updateEmailTemplate(
          selectedTemplateId,
          {
            name: form.name.trim(),
            subject: form.subject.trim(),
            body: form.body,
          },
        );
        setTemplates((prev) =>
          prev.map((template) =>
            template.id === updated.id ? updated : template,
          ),
        );
        toast.success(EMAIL_TEMPLATE_MESSAGES.updated);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, EMAIL_TEMPLATE_MESSAGES.saveFailed),
      );
    } finally {
      setIsSaving(false);
    }
  }, [form.body, form.name, form.subject, selectedTemplateId]);

  const handleDelete = useCallback(async () => {
    if (selectedTemplateId === null) return;

    if (!window.confirm(EMAIL_TEMPLATE_MESSAGES.deleteConfirm)) return;

    setIsDeleting(true);
    try {
      await emailTemplateApi.deleteEmailTemplate(selectedTemplateId);
      const nextTemplates = templates.filter(
        (template) => template.id !== selectedTemplateId,
      );
      setTemplates(nextTemplates);
      setSelectedTemplateId(nextTemplates[0]?.id ?? null);
      if (nextTemplates.length === 0) {
        setForm(EMPTY_EMAIL_TEMPLATE_FORM);
      }
      setPreview(null);
      toast.success(EMAIL_TEMPLATE_MESSAGES.deleted);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, EMAIL_TEMPLATE_MESSAGES.deleteFailed),
      );
    } finally {
      setIsDeleting(false);
    }
  }, [selectedTemplateId, templates]);

  const handleRenderPreview = useCallback(async () => {
    if (selectedTemplateId === null) {
      toast.error(EMAIL_TEMPLATE_MESSAGES.previewSelectFirst);
      return;
    }

    setIsRendering(true);
    try {
      const variables = parseTemplateVariablesJson(variablesInput);
      const normalizedVariables = { ...variables } as Record<string, string | number | boolean | null>;
      for (const key of placeholderKeys) {
        if (!(key in normalizedVariables)) {
          normalizedVariables[key] = "";
        }
      }
      const rendered = await emailTemplateApi.renderEmailTemplate(
        selectedTemplateId,
        { variables: normalizedVariables },
      );
      setPreview(rendered);
      toast.success(EMAIL_TEMPLATE_MESSAGES.previewUpdated);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, EMAIL_TEMPLATE_MESSAGES.previewFailed),
      );
    } finally {
      setIsRendering(false);
    }
  }, [placeholderKeys, selectedTemplateId, variablesInput]);

  return {
    filteredTemplates,
    selectedTemplateId,
    searchQuery,
    setSearchQuery,
    setSelectedTemplateId,
    form,
    handleFormChange,
    variablesInput,
    setVariablesInput,
    preview,
    placeholderKeys,
    isNewTemplate,
    isSaving,
    isRendering,
    isDeleting,
    handleNewTemplate,
    handleSave,
    handleDelete,
    handleRenderPreview,
  };
}
