import { Suspense } from "react";
import InterviewBookingClient from "@/components/interview-booking/InterviewBookingClient";

export default function InterviewBookingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-black text-slate-600 shadow-sm">
            면접 일정을 불러오는 중입니다.
          </div>
        </main>
      }
    >
      <InterviewBookingClient />
    </Suspense>
  );
}
