"use client";

import { useState } from "react";
import { toast } from "sonner";
import HrModal from "@/components/hr/shared/HrModal";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import { interviewerInviteApi } from "@/lib/hr/interviewer-invites.client";
import type { HrInterviewer, InterviewerInviteResponse } from "@/types/interviewer";

interface InterviewerInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewer: HrInterviewer | null;
}

export default function InterviewerInviteModal({
  isOpen,
  onClose,
  interviewer,
}: InterviewerInviteModalProps) {
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<InterviewerInviteResponse | null>(null);

  if (!interviewer) return null;

  const handleCreateInvite = async () => {
    setIsSubmitting(true);
    try {
      const response = await interviewerInviteApi.createInvite({
        interviewerId: interviewer.interviewerId,
        expiresInDays,
      });
      setResult(response);
      toast.success("면접관 초대 링크를 생성했습니다.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "면접관 초대 링크 생성에 실패했습니다."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.inviteUrl) return;
    await navigator.clipboard.writeText(result.inviteUrl);
    toast.success("초대 링크를 복사했습니다.");
  };

  return (
    <HrModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="면접관 초대 링크 생성"
      subtitle={`${interviewer.interviewerName} · ${interviewer.interviewerEmail}`}
      eyebrow="Invite"
      eyebrowIcon="link-alt"
      theme="indigo"
      size="md"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {result?.inviteUrl ? (
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
            >
              <i className="bx bx-copy text-lg" />
              링크 복사
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleCreateInvite()}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <i
              className={`bx ${
                isSubmitting ? "bx-loader-alt animate-spin" : "bx-link"
              } text-lg`}
            />
            링크 생성
          </button>
        </div>
      }
    >
      <div className="space-y-5 p-5 sm:p-6">
        <label className="grid gap-2 text-sm font-black text-slate-600">
          링크 유효 기간
          <select
            value={expiresInDays}
            onChange={(event) => setExpiresInDays(Number(event.target.value))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          >
            {[3, 5, 7, 14, 30].map((day) => (
              <option key={day} value={day}>
                {day}일
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            안내
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            생성된 링크는 면접관이 최초 접속할 때 토큰 수락 흐름으로 연결됩니다.
            수락 후 인터뷰어 전용 화면으로 이동할 수 있습니다.
          </p>
        </div>

        {result ? (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
              Invite Ready
            </p>
            <p className="mt-2 break-all font-mono text-sm font-bold text-indigo-700">
              {result.inviteUrl}
            </p>
            <p className="mt-2 text-xs font-semibold text-indigo-600">
              만료 시각: {new Date(result.expiresAt).toLocaleString("ko-KR")}
            </p>
          </div>
        ) : null}
      </div>
    </HrModal>
  );
}
