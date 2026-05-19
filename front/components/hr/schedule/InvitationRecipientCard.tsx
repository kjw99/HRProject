"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { InvitationRecipientDraft } from "@/types/invitationPreview";
import type { RecipientUiState } from "@/lib/hr/invitation-preview.helpers";

export interface InvitationRecipientCardProps {
  recipient: InvitationRecipientDraft;
  index: number;
  isEditing: boolean;
  state: RecipientUiState;
  onCopyLink: (url: string) => void;
  onSend: (candidateId: number) => void;
  onFieldChange: (
    candidateId: number,
    field: "subject" | "content",
    value: string,
  ) => void;
}

function InvitationRecipientCardImpl({
  recipient,
  index,
  isEditing,
  state,
  onCopyLink,
  onSend,
  onFieldChange,
}: InvitationRecipientCardProps) {
  const status = state.status;
  const error = state.error;

  return (
    <motion.article
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-black text-slate-900">
            {recipient.name}
          </h2>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {recipient.email ?? "이메일 미기재"} · 후보자 #
            {recipient.candidateId}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCopyLink(recipient.invitationUrl)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
          >
            <i className="bx bx-link" />
            링크 복사
          </button>
          <button
            type="button"
            onClick={() => onSend(recipient.candidateId)}
            disabled={status === "sending" || status === "sent"}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-black text-white hover:bg-indigo-700 disabled:opacity-45"
          >
            <i
              className={
                status === "sending"
                  ? "bx bx-loader-alt animate-spin"
                  : "bx bx-send"
              }
            />
            {status === "sent" ? "발송 완료" : "개별 발송"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <p className="break-all font-mono text-xs font-bold text-slate-600">
          {recipient.invitationUrl}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1.5 text-xs font-black text-slate-500">
          메일 제목
          <input
            value={recipient.subject}
            readOnly={!isEditing}
            onChange={(event) =>
              onFieldChange(
                recipient.candidateId,
                "subject",
                event.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none read-only:bg-slate-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-black text-slate-500">
          최종 메일 내용
          <textarea
            value={recipient.content}
            readOnly={!isEditing}
            rows={9}
            onChange={(event) =>
              onFieldChange(
                recipient.candidateId,
                "content",
                event.target.value,
              )
            }
            className="resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-6 text-slate-800 outline-none read-only:bg-slate-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
      </div>

      {status === "failed" ? (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">
          {error}
        </p>
      ) : status === "sent" ? (
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          최종 메일을 발송했습니다.
        </p>
      ) : null}
    </motion.article>
  );
}

/**
 * 수신자 카드: 한 명의 status 변경 시 다른 카드들이 리렌더되지 않도록 memo 처리.
 * 부모는 onCopyLink/onSend/onFieldChange를 useCallback으로 안정적으로 전달해야 합니다.
 */
export const InvitationRecipientCard = memo(InvitationRecipientCardImpl);
