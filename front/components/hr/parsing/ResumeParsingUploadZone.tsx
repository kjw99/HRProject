"use client";

import type { ResumeParsingUploadZoneProps } from "@/types/parsing-ui";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeParsingUploadZone({
  files,
  isDragActive,
  isDisabled,
  maxFiles,
  getRootProps,
  getInputProps,
  onRemoveFile,
  onStartParsing,
  isStarting,
}: ResumeParsingUploadZoneProps) {
  const canStart = files.length > 0 && !isDisabled && !isStarting;

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] sm:rounded-3xl sm:p-6">
      <div
        {...getRootProps()}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-10 ${
          isDragActive
            ? "border-indigo-400 bg-indigo-50/80 shadow-inner"
            : "border-slate-200 bg-gradient-to-b from-slate-50/80 to-white hover:border-indigo-300 hover:bg-indigo-50/30"
        } ${isDisabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        <div
          className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl transition-opacity ${
            isDragActive
              ? "bg-indigo-300/40 opacity-100"
              : "bg-indigo-200/20 opacity-0 group-hover:opacity-100"
          }`}
        />
        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200/60">
          <i className="bx bx-cloud-upload text-2xl" />
        </div>
        <p className="relative text-base font-black text-slate-800 sm:text-lg">
          {isDragActive
            ? "여기에 놓으면 업로드됩니다"
            : "파일을 끌어다 놓거나 클릭하여 선택"}
        </p>
        <p className="relative mt-2 text-xs font-semibold text-slate-500 sm:text-sm">
          PDF · DOCX · HWP · TXT · PPT 등 · 최대 {maxFiles}개
        </p>
      </div>

      {files.length > 0 ? (
        <div className="mt-5 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            선택된 파일 ({files.length}/{maxFiles})
          </p>

          <ul className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                  <i className="bx bx-file text-lg" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {file.name}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  disabled={isDisabled}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                  aria-label={`${file.name} 제거`}
                >
                  <i className="bx bx-trash text-lg" />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onStartParsing}
            disabled={!canStart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-200/50 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <i className="bx bx-loader-alt bx-spin text-lg" />
                작업 시작 중…
              </>
            ) : (
              <>
                <i className="bx bx-bot text-lg" />
                AI 이력서 파싱 시작
              </>
            )}
          </button>
        </div>
      ) : null}
    </section>
  );
}
