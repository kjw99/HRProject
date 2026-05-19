"use client";

import dynamic from "next/dynamic";
import { useEmailTemplateManager } from "./useEmailTemplateManager";
import type { EmailTemplateManagerClientProps } from "@/types/email-template-ui";

const EmailTemplateEditorPanel = dynamic(
  () => import("./EmailTemplateEditorPanel"),
  { loading: () => <div className="h-72 animate-pulse rounded-2xl bg-slate-100" /> },
);
const EmailTemplateListPanel = dynamic(
  () => import("./EmailTemplateListPanel"),
  { loading: () => <div className="h-80 animate-pulse rounded-2xl bg-slate-100" /> },
);
const EmailTemplatePreviewPanel = dynamic(
  () => import("./EmailTemplatePreviewPanel"),
  { loading: () => <div className="h-60 animate-pulse rounded-2xl bg-slate-100" /> },
);
const EmailTemplateVariablesPanel = dynamic(
  () => import("./EmailTemplateVariablesPanel"),
  { loading: () => <div className="h-60 animate-pulse rounded-2xl bg-slate-100" /> },
);

export default function EmailTemplateManagerClient(
  props: EmailTemplateManagerClientProps,
) {
  const {
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
  } = useEmailTemplateManager(props);

  return (
    <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
      <EmailTemplateListPanel
        templates={filteredTemplates}
        selectedTemplateId={selectedTemplateId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={setSelectedTemplateId}
        onCreateNew={handleNewTemplate}
      />

      <div className="flex min-h-0 flex-col gap-4">
        <EmailTemplateEditorPanel
          isNew={isNewTemplate}
          form={form}
          onFormChange={handleFormChange}
          isSaving={isSaving}
          isDeleting={isDeleting}
          isRendering={isRendering}
          canDelete={!isNewTemplate}
          canPreview={!isNewTemplate}
          onSave={() => void handleSave()}
          onDelete={() => void handleDelete()}
          onPreview={() => void handleRenderPreview()}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <EmailTemplateVariablesPanel
            placeholderKeys={placeholderKeys}
            variablesInput={variablesInput}
            onVariablesInputChange={setVariablesInput}
          />
          <EmailTemplatePreviewPanel
            preview={preview}
            isRendering={isRendering}
          />
        </div>
      </div>
    </div>
  );
}
