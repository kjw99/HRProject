"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/lib/stores/auth";
import { getApiErrorMessage } from "@/lib/hr/api-error";
import { interviewerInviteApi } from "@/lib/hr/interviewer-invites.client";
import InviteAcceptResultCard from "./InviteAcceptResultCard";

interface InterviewerInviteAcceptClientProps {
  initialToken?: string;
}

export default function InterviewerInviteAcceptClient({
  initialToken = "",
}: InterviewerInviteAcceptClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState(
    "초대 링크를 확인한 뒤 수락하면 인터뷰어 전용 화면으로 이동할 수 있습니다.",
  );
  const [interviewerName, setInterviewerName] = useState<string | undefined>();

  const token = useMemo(
    () => initialToken || searchParams.get("token") || "",
    [initialToken, searchParams],
  );

  const handleAccept = async () => {
    if (!token) {
      setStatus("error");
      setMessage("초대 토큰이 없습니다. 올바른 링크로 다시 접속해주세요.");
      return;
    }

    setStatus("loading");
    try {
      const response = await interviewerInviteApi.acceptInvite({ token });
      setAuth(response.interviewer.interviewerName, response.accessToken);
      setInterviewerName(response.interviewer.interviewerName);
      setStatus("success");
      setMessage(
        "초대 수락이 완료되었습니다. 이제 인터뷰어 질문 생성 화면으로 이동할 수 있습니다.",
      );
      toast.success("초대 수락이 완료되었습니다.");
    } catch (error) {
      setStatus("error");
      setMessage(
        getApiErrorMessage(
          error,
          "초대 수락에 실패했습니다. 만료되었거나 이미 사용된 링크일 수 있습니다.",
        ),
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-10">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/40 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-indigo-300/15 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
              <i className="bx bx-user-check text-sm" />
              Interviewer Invite
            </p>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                면접관 초대 수락
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                이메일로 받은 초대 링크를 확인하고 계정을 활성화하세요. 수락이
                끝나면 인터뷰어 전용 질문 생성 화면으로 바로 이동할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleAccept()}
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <i
              className={`bx ${
                status === "loading" ? "bx-loader-alt animate-spin" : "bx-check"
              } text-lg`}
            />
            초대 수락하기
          </button>
        </div>
      </section>

      <InviteAcceptResultCard
        status={status}
        title={
          status === "success"
            ? "초대 수락 완료"
            : status === "error"
              ? "초대 수락 실패"
              : status === "loading"
                ? "초대 수락 처리 중"
                : "초대 링크 확인"
        }
        description={message}
        interviewerName={interviewerName}
        actionHref={status === "success" ? "/interviewer" : undefined}
        actionLabel={status === "success" ? "Interviewer 화면으로 이동" : undefined}
      />

      {status === "success" ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/interviewer")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            <i className="bx bx-right-arrow-alt text-lg" />
            바로 이동
          </button>
        </div>
      ) : null}
    </div>
  );
}
