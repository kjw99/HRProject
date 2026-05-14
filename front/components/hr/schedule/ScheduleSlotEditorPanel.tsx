"use client";

import { FormEvent } from "react";
import type { InterviewRoundWrite } from "@/types/interviewSlotWrite";
import type { HrInterviewer } from "@/types/interviewer";
import type { Position } from "@/types/position";
import type { ScheduleSlotFormMode, ScheduleSlotFormState } from "./types";

const ROUND_OPTIONS: InterviewRoundWrite[] = ["1차", "2차", "3차"];

export interface ScheduleSlotEditorPanelProps {
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
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-black/4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Editor
          </p>
          <h2 className="truncate text-base font-black text-slate-900 sm:text-lg">
            {formMode === "edit" ? "슬롯 수정" : "슬롯 생성"}
          </h2>
        </div>
        {formMode === "create" ? (
          <button
            type="button"
            onClick={onStartCreate}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800"
            aria-label="새 일정"
          >
            <i className="bx bx-plus text-xl" />
          </button>
        ) : null}
      </div>

      <div className="grid gap-3">
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
          <div className="custom-scrollbar flex max-h-28 flex-wrap gap-2 overflow-y-auto">
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

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
      >
        <i className={isSaving ? "bx bx-loader-alt animate-spin" : "bx bx-save"} />
        {formMode === "edit" ? "수정 저장" : "일정 생성"}
      </button>
    </form>
  );
}
