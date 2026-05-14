"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { AvailableInterviewSlot } from "@/types/interviewBooking";
import { candidateMailApi } from "@/lib/hr/mail.client";

interface InvitationRecipientDraft {
  candidateId: number;
  name: string;
  email: string | null;
  invitationUrl: string;
  subject: string;
  content: string;
}

interface InvitationFailureDraft {
  candidateId: number;
  name: string;
  email?: string | null;
  error?: string;
}

interface InvitationPreviewDraft {
  createdAt: string;
  slotIds: number[];
  slots: AvailableInterviewSlot[];
  recipients: InvitationRecipientDraft[];
  failures: InvitationFailureDraft[];
}

type SendStatus = "idle" | "sending" | "sent" | "failed";

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybe = error as {
    response?: { data?: { message?: string; detail?: string } };
  };
  return maybe.response?.data?.message || maybe.response?.data?.detail || fallback;
};

const formatSlot = (slot: AvailableInterviewSlot) =>
  new Date(slot.interviewStartsAt).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const canUseMockPreview = () => {
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

const createMockDraft = (): InvitationPreviewDraft => {
  const base = new Date();
  base.setHours(10, 0, 0, 0);
  const slots: AvailableInterviewSlot[] = [
    {
      slotId: 9801,
      interviewRound: "1차",
      interviewStartsAt: base.toISOString(),
      interviewEndsAt: new Date(base.getTime() + 30 * 60 * 1000).toISOString(),
      interviewLocation: "본사 3층 회의실 A",
      remainingCapacity: 3,
    },
    {
      slotId: 9802,
      interviewRound: "1차",
      interviewStartsAt: new Date(
        base.getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      ).toISOString(),
      interviewEndsAt: new Date(
        base.getTime() + 24 * 60 * 60 * 1000 + 150 * 60 * 1000,
      ).toISOString(),
      interviewLocation: "온라인 Zoom",
      remainingCapacity: 1,
    },
  ];
  const invitationUrl = "http://localhost:3000/interview-booking?token=mock-token";

  return {
    createdAt: new Date().toISOString(),
    slotIds: slots.map((slot) => slot.slotId),
    slots,
    recipients: [
      {
        candidateId: 98001,
        name: "목업 지원자",
        email: "mock.candidate@example.com",
        invitationUrl,
        subject: "[면접 일정 선택 안내] 가능한 시간을 선택해 주세요",
        content: [
          "목업 지원자님, 안녕하세요.",
          "",
          "아래 링크에서 가능한 면접 일정 중 하나를 선택해 주세요.",
          "",
          invitationUrl,
          "",
          "[선택 가능한 면접 시간대]",
          ...slots.map(
            (slot) =>
              `- ${formatSlot(slot)} · ${slot.interviewRound} · ${
                slot.interviewLocation ?? "장소 미정"
              }`,
          ),
          "",
          "감사합니다.",
        ].join("\n"),
      },
    ],
    failures: [],
  };
};

function readInvitationPreviewDraft(draftId: string): string | null {
  if (typeof window === "undefined") return null;
  const key = `interview-invitation-preview:${draftId}`;
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export default function InvitationPreviewClient() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft") ?? "";
  const [draft, setDraft] = useState<InvitationPreviewDraft | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statuses, setStatuses] = useState<Record<number, SendStatus>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!draftId) {
      if (canUseMockPreview()) {
        const mockDraft = createMockDraft();
        setDraft(mockDraft);
        setIsMockMode(true);
        setStatuses(
          Object.fromEntries(
            mockDraft.recipients.map((recipient) => [
              recipient.candidateId,
              "idle",
            ]),
          ),
        );
      }
      return;
    }

    const raw = readInvitationPreviewDraft(draftId);
    if (!raw) {
      if (canUseMockPreview()) {
        const mockDraft = createMockDraft();
        setDraft(mockDraft);
        setIsMockMode(true);
        setStatuses(
          Object.fromEntries(
            mockDraft.recipients.map((recipient) => [
              recipient.candidateId,
              "idle",
            ]),
          ),
        );
      }
      return;
    }

    try {
      const parsed = JSON.parse(raw) as InvitationPreviewDraft;
      setDraft(parsed);
      setIsMockMode(false);
      setStatuses(
        Object.fromEntries(
          parsed.recipients.map((recipient) => [recipient.candidateId, "idle"]),
        ),
      );
    } catch {
      toast.error("초대 메일 미리보기 데이터를 읽지 못했습니다.");
    }
  }, [draftId]);

  const sentCount = useMemo(
    () => Object.values(statuses).filter((status) => status === "sent").length,
    [statuses],
  );

  const updateRecipient = (
    candidateId: number,
    field: "subject" | "content",
    value: string,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recipients: prev.recipients.map((recipient) =>
          recipient.candidateId === candidateId
            ? { ...recipient, [field]: value }
            : recipient,
        ),
      };
    });
  };

  const copyAllLinks = async () => {
    if (!draft) return;
    const text = draft.recipients
      .map((recipient) => `${recipient.name}: ${recipient.invitationUrl}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("생성 링크 목록을 복사했습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const copySingleLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크를 복사했습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const sendMail = async (recipient: InvitationRecipientDraft) => {
    setStatuses((prev) => ({ ...prev, [recipient.candidateId]: "sending" }));
    setErrors((prev) => ({ ...prev, [recipient.candidateId]: "" }));
    try {
      if (isMockMode) {
        setStatuses((prev) => ({ ...prev, [recipient.candidateId]: "sent" }));
        toast.success("mock 메일 발송 완료로 표시했습니다.");
        return;
      }

      await candidateMailApi.sendCandidateMail(recipient.candidateId, {
        subject: recipient.subject,
        content: recipient.content,
      });
      setStatuses((prev) => ({ ...prev, [recipient.candidateId]: "sent" }));
    } catch (error) {
      setStatuses((prev) => ({ ...prev, [recipient.candidateId]: "failed" }));
      setErrors((prev) => ({
        ...prev,
        [recipient.candidateId]: getErrorMessage(error, "메일 발송 실패"),
      }));
    }
  };

  const sendAllMails = async () => {
    if (!draft) return;
    for (const recipient of draft.recipients) {
      if (statuses[recipient.candidateId] === "sent") continue;
      await sendMail(recipient);
    }
    toast.success("최종 메일 발송 처리가 완료되었습니다.");
  };

  if (!draft) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <i className="bx bx-error-circle text-4xl text-amber-500" />
          <h1 className="mt-3 text-lg font-black text-slate-900">
            미리보기 데이터를 찾을 수 없습니다.
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            초대 링크 생성 화면에서 다시 열어 주세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                Invitation Preview
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                초대 링크 및 최종 메일 확인
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                링크를 확인하고, 메일 내용을 수정한 뒤 최종 발송하세요.
              </p>
              {isMockMode ? (
                <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                  개발/localhost mock 미리보기입니다.
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={copyAllLinks}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <i className="bx bx-copy" />
                생성 링크 전체 복사
              </button>
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
              >
                <i className="bx bx-edit" />
                {isEditing ? "수정 완료" : "메일 내용 수정하기"}
              </button>
              <button
                type="button"
                onClick={() => void sendAllMails()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                <i className="bx bx-send" />
                최종 메일 보내기
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase text-slate-400">
                대상자
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {draft.recipients.length}명
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase text-slate-400">
                선택 슬롯
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {draft.slotIds.length}개
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase text-slate-400">
                발송 완료
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {sentCount}/{draft.recipients.length}
              </p>
            </div>
          </div>
        </header>

        {draft.slots.length > 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">
              지원자에게 열릴 면접 슬롯
            </h2>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {draft.slots.map((slot) => (
                <li
                  key={slot.slotId}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                >
                  {formatSlot(slot)} · {slot.interviewRound} ·{" "}
                  {slot.interviewLocation ?? "장소 미정"}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {draft.failures.length > 0 ? (
          <section className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <h2 className="text-sm font-black text-rose-700">
              링크 생성 실패
            </h2>
            <ul className="mt-3 space-y-2 text-sm font-bold text-rose-700">
              {draft.failures.map((failure) => (
                <li key={failure.candidateId}>
                  {failure.name}: {failure.error ?? "초대 링크 생성 실패"}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="space-y-4">
          {draft.recipients.map((recipient, index) => {
            const status = statuses[recipient.candidateId] ?? "idle";
            return (
              <motion.article
                key={recipient.candidateId}
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
                      onClick={() => void copySingleLink(recipient.invitationUrl)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                    >
                      <i className="bx bx-link" />
                      링크 복사
                    </button>
                    <button
                      type="button"
                      onClick={() => void sendMail(recipient)}
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
                        updateRecipient(
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
                        updateRecipient(
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
                    {errors[recipient.candidateId]}
                  </p>
                ) : status === "sent" ? (
                  <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    최종 메일이 발송되었습니다.
                  </p>
                ) : null}
              </motion.article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
