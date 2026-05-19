"use client";

import { memo, useMemo } from "react";
import { formatSlot } from "@/lib/hr/invitation-preview.helpers";
import type { AvailableInterviewSlot } from "@/types/interviewBooking";

export interface InvitationSlotCandidatesPanelProps {
  slots: AvailableInterviewSlot[];
}

interface FormattedSlot {
  slotId: number;
  label: string;
}

function InvitationSlotCandidatesPanelImpl({
  slots,
}: InvitationSlotCandidatesPanelProps) {
  const items = useMemo<FormattedSlot[]>(
    () =>
      slots.map((slot) => ({
        slotId: slot.slotId,
        label: `${formatSlot(slot)} · ${slot.interviewRound} · ${
          slot.interviewLocation ?? "장소 미정"
        }`,
      })),
    [slots],
  );

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-black text-slate-900">
        지원자에게 열릴 면접 후보
      </h2>
      <ul className="mt-3 grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.slotId}
            className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
          >
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export const InvitationSlotCandidatesPanel = memo(
  InvitationSlotCandidatesPanelImpl,
);
