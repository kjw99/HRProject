"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { interviewerInviteApi } from "@/lib/hr/interviewer-invites.client";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import type { InterviewerAvailabilityResponse } from "@/types/interviewer";

export default function InterviewerAvailabilityClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [data, setData] = useState<InterviewerAvailabilityResponse | null>(null);
  const [decision, setDecision] = useState<"accepted" | "declined">("accepted");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("초대 토큰이 없습니다.");
      setIsLoading(false);
      return;
    }

    let ignore = false;
    setIsLoading(true);
    interviewerInviteApi
      .getAvailability(token)
      .then((res) => {
        if (ignore) return;
        setData(res);
        if (res.decision === "declined") setDecision("declined");
        setNote(res.note ?? "");
      })
      .catch((error) => {
        if (ignore) return;
        setErrorMessage(
          getApiErrorMessage(error, "면접 참여 응답 정보를 불러오지 못했습니다."),
        );
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const decidedLabel = useMemo(() => {
    if (!data?.decision) return null;
    return data.decision === "accepted" ? "참여 가능" : "참여 어려움";
  }, [data?.decision]);

  const handleSubmit = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const res = await interviewerInviteApi.submitAvailability(token, {
        decision,
        note: note.trim() || undefined,
      });
      setData(res);
      toast.success("응답이 제출되었습니다.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "응답 제출에 실패했습니다."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-black text-slate-600 shadow-sm">
          참여 가능 여부를 확인하는 중입니다.
        </div>
      </main>
    );
  }

  if (errorMessage || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-black text-rose-700">접속할 수 없습니다</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
            Interviewer Availability
          </p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">
            면접 참여 여부를 알려주세요
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {data.interviewer.interviewerName} 님, 아래 일정 확인 후 참여 가능 여부를 선택해 주세요.
          </p>
          <p className="mt-2 text-xs font-bold text-slate-500">
            링크 만료: {format(parseISO(data.expiresAt), "yyyy.MM.dd HH:mm", { locale: ko })}
          </p>
          {decidedLabel ? (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              기존 응답: {decidedLabel}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">예정된 면접 일정</h2>
          {data.slots.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-slate-500">
              현재 연결된 예정 일정이 없습니다. 응답 메모에 가능 시간을 남겨주세요.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.slots.map((slot) => (
                <li
                  key={slot.slotId}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  {format(parseISO(slot.interviewStartsAt), "M/d (EEE) HH:mm", { locale: ko })}
                  {" - "}
                  {format(parseISO(slot.interviewEndsAt), "HH:mm", { locale: ko })}
                  {" · "}
                  {slot.interviewRound}
                  {" · "}
                  {slot.interviewLocation ?? "장소 미정"}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">응답 제출</h2>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setDecision("accepted")}
              className={`rounded-xl px-4 py-2 text-sm font-black ${
                decision === "accepted"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              참여 가능
            </button>
            <button
              type="button"
              onClick={() => setDecision("declined")}
              className={`rounded-xl px-4 py-2 text-sm font-black ${
                decision === "declined"
                  ? "bg-rose-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              참여 어려움
            </button>
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="전달할 메모가 있으면 작성해 주세요 (예: 가능한 시간대)."
            className="mt-3 h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
          >
            {isSaving ? "제출 중..." : "응답 제출"}
          </button>
        </section>
      </div>
    </main>
  );
}
