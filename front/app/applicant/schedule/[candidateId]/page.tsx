import {
  HighlightInterviewCard,
  PreparationCard,
} from "@/components/applicant/schedule/ScheduleComponents";
import { fetchScheduleData } from "@/lib/axios";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ candidateId: string }>;
};

/** URL 세그먼트 이름은 candidateId이나, 현재 목업/API에서는 면접 일건의 `InterviewEvent.id`와 매칭합니다. */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { candidateId } = await params;
  const scheduleData = await fetchScheduleData();
  const event = scheduleData.events.find((e) => e.id === candidateId);

  return {
    title: event
      ? `${event.title} | 면접 일정 | A-RECRUIT`
      : "면접 일정 | A-RECRUIT",
    description: event
      ? `${event.date} ${event.time} · ${event.type === "ONLINE" ? "화상" : "오프라인"} 면접 상세`
      : "지원자 면접 일정 상세",
  };
}

export default async function ApplicantScheduleDetailPage({
  params,
}: PageProps) {
  const { candidateId } = await params;
  const scheduleData = await fetchScheduleData();
  const event = scheduleData.events.find((e) => e.id === candidateId);

  if (!event) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/applicant/schedule"
          className="inline-flex w-fit items-center gap-2 text-[14px] font-bold text-indigo-600 transition hover:text-indigo-800"
        >
          <i className="bx bx-chevron-left text-lg" aria-hidden />
          전체 일정으로
        </Link>
        <p className="text-[13px] font-medium text-slate-500">
          일정 ID:{" "}
          <span className="font-mono text-slate-700">{candidateId}</span>
        </p>
      </div>

      <header className="mb-2">
        <h1 className="text-[28px] font-black tracking-tight text-slate-900 md:text-[32px]">
          면접 상세
        </h1>
        <p className="mt-1 font-medium text-slate-500">
          {scheduleData.applicantName} 님 · 이 일정의 정보와 준비 사항을 확인하세요.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HighlightInterviewCard event={event} />
        </div>
        <div className="lg:col-span-1">
          <PreparationCard preparations={event.preparation ?? []} />
        </div>
      </div>

      <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-[16px] font-black text-slate-800">
          <i className="bx bx-info-circle text-indigo-500" aria-hidden />
          안내
        </h2>
        <dl className="space-y-3 text-[14px]">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="shrink-0 font-bold text-slate-400">장소 / 링크</dt>
            <dd className="font-medium break-all text-slate-800">
              {event.locationOrLink}
            </dd>
          </div>
          {event.interviewerInfo ? (
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="shrink-0 font-bold text-slate-400">면접관</dt>
              <dd className="font-medium text-slate-800">
                {event.interviewerInfo}
              </dd>
            </div>
          ) : null}
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="shrink-0 font-bold text-slate-400">상태</dt>
            <dd className="font-medium text-slate-800">{event.status}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
