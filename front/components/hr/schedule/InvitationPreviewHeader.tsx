"use client";

import { memo } from "react";
import InvitationPreviewBackButton from "./InvitationPreviewBackButton";

export interface InvitationPreviewHeaderProps {
  recipientCount: number;
  slotCount: number;
  sentCount: number;
  isMockMode: boolean;
  isEditing: boolean;
  onCopyAllLinks: () => void;
  onToggleEditing: () => void;
  onSendAll: () => void;
}

function InvitationPreviewHeaderImpl({
  recipientCount,
  slotCount,
  sentCount,
  isMockMode,
  isEditing,
  onCopyAllLinks,
  onToggleEditing,
  onSendAll,
}: InvitationPreviewHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center sm:mb-4">
        <InvitationPreviewBackButton />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
            Invitation Preview
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">
            초대 링크 및 최종 메일 확인
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            링크를 확인하고, 템플릿을 적용하거나 직접 수정한 뒤 최종 발송하세요.
          </p>
          {isMockMode ? (
            <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
              개발용 mock 미리보기입니다.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCopyAllLinks}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <i className="bx bx-copy" />
            생성 링크 전체 복사
          </button>
          <button
            type="button"
            onClick={onToggleEditing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            <i className="bx bx-edit" />
            {isEditing ? "수정 완료" : "메일 내용 수정"}
          </button>
          <button
            type="button"
            onClick={onSendAll}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
          >
            <i className="bx bx-send" />
            최종 메일 보내기
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="대상자" value={`${recipientCount}명`} />
        <SummaryCard label="선택 후보" value={`${slotCount}개`} />
        <SummaryCard
          label="발송 완료"
          value={`${sentCount}/${recipientCount}`}
        />
      </div>
    </header>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

export const InvitationPreviewHeader = memo(InvitationPreviewHeaderImpl);
