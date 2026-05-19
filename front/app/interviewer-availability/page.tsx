import { Suspense } from "react";
import InterviewerAvailabilityClient from "@/components/interviewer/availability/InterviewerAvailabilityClient";

export default function InterviewerAvailabilityPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-black text-slate-600 shadow-sm">
            참여 일정 정보를 불러오는 중입니다.
          </div>
        </main>
      }
    >
      <InterviewerAvailabilityClient />
    </Suspense>
  );
}
