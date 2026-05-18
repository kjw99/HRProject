"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { InterviewRoundWrite } from "@/types/interviewSlotWrite";
import type { HrInterviewer } from "@/types/interviewer";
import type { Position } from "@/types/position";
import type { ScheduleSlotFormMode, ScheduleSlotFormState } from "./types";

const ROUND_OPTIONS: InterviewRoundWrite[] = ["1차", "2차", "3차"];

export interface ScheduleSlotEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  form: ScheduleSlotFormState;
  formMode: ScheduleSlotFormMode;
  positions: Position[];
  filteredInterviewers: HrInterviewer[];
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onStartCreate: () => void;
  onUpdateForm: <K extends keyof ScheduleSlotFormState>(
    key: K,
    value: ScheduleSlotFormState[K],
  ) => void;
  onToggleInterviewer: (interviewerId: number) => void;
}

export function ScheduleSlotEditorPanel({
  isOpen,
  onClose,
  form,
  formMode,
  positions,
  filteredInterviewers,
  isSaving,
  onSubmit,
  onStartCreate,
  onUpdateForm,
  onToggleInterviewer,
}: ScheduleSlotEditorPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isSaving, onClose]);

  if (!mounted || !isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/45 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-editor-title"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="max-h-[min(92vh,760px)] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {formMode === "edit" ? "Edit slot" : "New slot"}
            </p>
            <h2
              id="slot-editor-title"
              className="mt-1 truncate text-lg font-black text-slate-900"
            >
              {formMode === "edit" ? "면접 일정 수정" : "면접 일정 생성"}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              저장 후 캘린더·목록에 바로 반영됩니다.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {formMode === "create" ? (
              <button
                type="button"
                onClick={onStartCreate}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                title="폼 초기화"
                aria-label="폼 초기화"
              >
                <i className="bx bx-refresh text-xl" />
              </button>
            ) : null}
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              aria-label="닫기"
            >
              <i className="bx bx-x text-xl" />
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex max-h-[min(78vh,640px)] flex-col"
        >
          <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
              직무
              <select
                value={form.positionId}
                onChange={(e) => onUpdateForm("positionId", e.target.value)}
                required={formMode === "create"}
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="">직무 선택</option>
                {positions.map((position) => (
                  <option key={position.positionId} value={position.positionId}>
                    {position.positionName}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
                차수
                <select
                  value={form.interviewRound}
                  onChange={(e) =>
                    onUpdateForm("interviewRound", e.target.value as InterviewRoundWrite)
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                >
                  {ROUND_OPTIONS.map((round) => (
                    <option key={round} value={round}>
                      {round}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
                정원
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => onUpdateForm("capacity", e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
              날짜
              <input
                type="date"
                value={form.interviewDate}
                onChange={(e) => onUpdateForm("interviewDate", e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
                시작
                <input
                  type="time"
                  value={form.interviewStartTime}
                  onChange={(e) => onUpdateForm("interviewStartTime", e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
              <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
                종료
                <input
                  type="time"
                  value={form.interviewEndTime}
                  onChange={(e) => onUpdateForm("interviewEndTime", e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
              장소
              <input
                value={form.interviewLocation}
                onChange={(e) => onUpdateForm("interviewLocation", e.target.value)}
                placeholder="본사 5층 회의실"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-500">
                면접관
              </p>
              <div className="custom-scrollbar flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {filteredInterviewers.length === 0 ? (
                  <span className="text-xs font-bold text-slate-400">
                    직무·차수에 맞는 면접관이 없습니다.
                  </span>
                ) : (
                  filteredInterviewers.map((interviewer) => {
                    const active = form.interviewerIds.includes(
                      interviewer.interviewerId,
                    );
                    return (
                      <button
                        key={interviewer.interviewerId}
                        type="button"
                        onClick={() => onToggleInterviewer(interviewer.interviewerId)}
                        className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                          active
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {interviewer.interviewerName}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2 border-t border-slate-100 bg-white px-5 py-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex flex-[1.2] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
            >
              <i className={isSaving ? "bx bx-loader-alt animate-spin" : "bx bx-save"} />
              {formMode === "edit" ? "수정 저장" : "일정 생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
