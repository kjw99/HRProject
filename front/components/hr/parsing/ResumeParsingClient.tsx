"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import ApplicantDeleteConfirmModal from "@/components/hr/applicants/ApplicantDeleteConfirmModal";
import ApplicantEditModal from "@/components/hr/applicants/ApplicantEditModal";
import { useResumeParseJobContext } from "@/components/hr/parsing/ResumeParseJobProvider";
import ResumeParsingJobProgress from "./ResumeParsingJobProgress";
import ResumeParsingResultsSection from "./ResumeParsingResultsSection";
import ResumeParsingUploadZone from "./ResumeParsingUploadZone";
import ResumeDetailModal from "./ResumeDetailModal";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import { deleteApplicant, updateApplicant } from "@/lib/hr/interview.client";
import {
  collectPositionOptions,
  isPersistedParseRow,
  tableRowToApplicant,
  updateTableRowFromApplicant,
} from "@/lib/hr/parsing-mapper";
import {
  RESUME_PARSE_ACCEPTED_FILES,
  RESUME_PARSE_MAX_FILES,
  RESUME_PARSE_POSITION_ALL,
} from "@/lib/hr/parsing.constants";
import { downloadExcelFromBase64 } from "@/lib/hr/parsing.client";
import type { Applicant, ApplicantUpdatePayload } from "@/types/applicant";
import type { TableRowData } from "@/types/parsing";
import type { ResumeParsingClientProps } from "@/types/parsing-ui";

export default function ResumeParsingClient({
  initialRows = [],
}: ResumeParsingClientProps) {
  const {
    parsedRows,
    excelPayload,
    updateParsedRow,
    removeParsedRow,
    startParse,
    isCreating,
    isJobActive,
    progress,
    jobError,
    registerOnSucceeded,
  } = useResumeParseJobContext();

  const [files, setFiles] = useState<File[]>([]);
  const [filterPosition, setFilterPosition] = useState(
    RESUME_PARSE_POSITION_ALL,
  );
  const [globalSearch, setGlobalSearch] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableRowData | null>(null);
  const [editTarget, setEditTarget] = useState<Applicant | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Applicant | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const results =
    parsedRows.length > 0 ? parsedRows : initialRows;

  const syncRowInResults = useCallback(
    (rowId: string, updater: (row: TableRowData) => TableRowData) => {
      updateParsedRow(rowId, updater);
      setSelectedRow((prev) =>
        prev?.id === rowId ? updater(prev) : prev,
      );
    },
    [updateParsedRow],
  );

  const removeRowFromResults = useCallback(
    (rowId: string) => {
      removeParsedRow(rowId);
      setSelectedRow((prev) => {
        if (prev?.id === rowId) {
          setIsDetailOpen(false);
          return null;
        }
        return prev;
      });
    },
    [removeParsedRow],
  );

  const openEditForRow = useCallback((row: TableRowData) => {
    if (!isPersistedParseRow(row)) {
      toast.error("DB에 저장되지 않은 파싱 결과는 수정할 수 없습니다.");
      return;
    }
    setEditTarget(tableRowToApplicant(row));
    setIsEditOpen(true);
  }, []);

  const openDeleteForRow = useCallback((row: TableRowData) => {
    if (!isPersistedParseRow(row)) {
      toast.error("DB에 저장되지 않은 파싱 결과는 삭제할 수 없습니다.");
      return;
    }
    setDeleteTarget(tableRowToApplicant(row));
    setIsDeleteOpen(true);
  }, []);

  useEffect(() => {
    return registerOnSucceeded(() => {
      setFiles([]);
    });
  }, [registerOnSucceeded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) =>
      [...prev, ...acceptedFiles].slice(0, RESUME_PARSE_MAX_FILES),
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: RESUME_PARSE_ACCEPTED_FILES,
    multiple: true,
    maxFiles: RESUME_PARSE_MAX_FILES,
    disabled: isJobActive,
  });

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleStartParsing = useCallback(() => {
    void startParse(files);
  }, [files, startParse]);

  const positionOptions = useMemo(
    () => collectPositionOptions(results),
    [results],
  );

  const handleDownloadExcel = useCallback(() => {
    if (!excelPayload) return;
    downloadExcelFromBase64(excelPayload.base64, excelPayload.fileName);
  }, [excelPayload]);

  const handleViewDetail = useCallback((row: TableRowData) => {
    setSelectedRow(row);
    setIsDetailOpen(true);
  }, []);

  const handleSaveApplicant = useCallback(
    async (payload: ApplicantUpdatePayload) => {
      if (!editTarget) return;

      const sourceRow = results.find(
        (row) =>
          row.raw.record.candidate.candidateId === editTarget.candidate_id,
      );
      if (!sourceRow) return;

      try {
        const updated = await updateApplicant(editTarget.candidate_id, payload);
        syncRowInResults(sourceRow.id, (row) =>
          updateTableRowFromApplicant(row, updated),
        );
        setEditTarget(updated);
        toast.success("지원자 정보가 수정되었습니다.");
        setIsEditOpen(false);
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "지원자 정보 수정 중 오류가 발생했습니다."),
        );
        throw error;
      }
    },
    [editTarget, results, syncRowInResults],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    const sourceRow = results.find(
      (row) =>
        row.raw.record.candidate.candidateId === deleteTarget.candidate_id,
    );
    if (!sourceRow) return;

    setIsDeleting(true);
    try {
      const response = await deleteApplicant(deleteTarget.candidate_id);
      removeRowFromResults(sourceRow.id);
      toast.success(response.message);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "지원자 삭제 중 오류가 발생했습니다."),
      );
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, results, removeRowFromResults]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <ResumeParsingUploadZone
        files={files}
        isDragActive={isDragActive}
        isDisabled={isJobActive}
        maxFiles={RESUME_PARSE_MAX_FILES}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        onRemoveFile={removeFile}
        onStartParsing={handleStartParsing}
        isStarting={isCreating}
      />

      <ResumeParsingJobProgress progress={progress} isVisible={isJobActive} />

      {jobError ? (
        <div
          className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
          role="alert"
        >
          <i className="bx bx-error-circle mt-0.5 shrink-0 text-lg" />
          <span>{jobError}</span>
        </div>
      ) : null}

      <ResumeParsingResultsSection
        rows={results}
        positionOptions={positionOptions}
        filterPosition={filterPosition}
        globalSearch={globalSearch}
        onFilterPositionChange={setFilterPosition}
        onGlobalSearchChange={setGlobalSearch}
        onViewDetail={handleViewDetail}
        onDeleteRow={openDeleteForRow}
        onDownloadExcel={handleDownloadExcel}
        excelFileName={excelPayload?.fileName}
        hasExcel={Boolean(excelPayload?.base64)}
      />

      <ResumeDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={selectedRow}
        onEdit={
          selectedRow ? () => openEditForRow(selectedRow) : undefined
        }
        onDelete={
          selectedRow ? () => openDeleteForRow(selectedRow) : undefined
        }
      />

      <ApplicantEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditTarget(null);
        }}
        applicant={editTarget}
        onSave={handleSaveApplicant}
        zIndex={130}
      />

      <ApplicantDeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        applicant={deleteTarget}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        zIndex={130}
      />
    </div>
  );
}
