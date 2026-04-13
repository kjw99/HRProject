import Link from "next/link";

export default function ApplicantInterviewPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
          Interview
        </p>
        <h1 className="text-3xl font-black tracking-tight">면접</h1>
        <p className="text-sm text-slate-600">
          온라인 면접 세션을 준비하는 화면입니다.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-sm text-slate-500">
        면접 UI는 추후 연동됩니다.
      </div>
      <Link
        href="/applicant/dashboard"
        className="text-sm font-bold text-blue-600 hover:text-blue-700"
      >
        ← 대시보드로 돌아가기
      </Link>
    </main>
  );
}
