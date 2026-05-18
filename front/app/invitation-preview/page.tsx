import { Suspense } from "react";
import InvitationPreviewClient from "@/components/hr/schedule/InvitationPreviewClient";

export default function InvitationPreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-black text-slate-600 shadow-sm">
            초대 메일 미리보기를 불러오는 중입니다.
          </div>
        </main>
      }
    >
      <InvitationPreviewClient />
    </Suspense>
  );
}
