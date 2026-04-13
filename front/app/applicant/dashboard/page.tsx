import Link from "next/link";

export default function ApplicantDashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Applicant
        </p>
        <h1 className="text-3xl font-black tracking-tight">지원자 대시보드</h1>
        <p className="text-sm text-slate-600">
          지원 현황과 일정을 이 화면에서 확인할 수 있습니다.
        </p>
      </header>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          아직 연결된 데이터가 없습니다. 면접 일정은 아래에서 확인하세요.
        </p>
        <Link
          href="/applicant/interview"
          className="mt-4 inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          면접 화면으로 이동 →
        </Link>
      </div>
    </main>
  );
}
