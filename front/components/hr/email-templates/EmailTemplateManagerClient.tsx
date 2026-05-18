"use client";

import EmailTemplateEditorPanel from "./EmailTemplateEditorPanel";
import EmailTemplateListPanel from "./EmailTemplateListPanel";
import EmailTemplatePreviewPanel from "./EmailTemplatePreviewPanel";
import EmailTemplateVariablesPanel from "./EmailTemplateVariablesPanel";
import { useEmailTemplateManager } from "./useEmailTemplateManager";
import type { EmailTemplateManagerClientProps } from "@/types/email-template-ui";

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
