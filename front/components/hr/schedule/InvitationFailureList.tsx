"use client";

import { memo } from "react";
import type { InvitationFailureDraft } from "@/types/invitationPreview";

export interface InvitationFailureListProps {
  failures: InvitationFailureDraft[];
}

function InvitationFailureListImpl({ failures }: InvitationFailureListProps) {
  if (failures.length === 0) return null;

  return (
    <section className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
      <h2 className="text-sm font-black text-rose-700">링크 생성 실패</h2>
      <ul className="mt-3 space-y-2 text-sm font-bold text-rose-700">
        {failures.map((failure) => (
          <li key={failure.candidateId}>
            {failure.name}: {failure.error ?? "초대 링크 생성 실패"}
          </li>
        ))}
      </ul>
    </section>
  );
}

export const InvitationFailureList = memo(InvitationFailureListImpl);
