export default function InterviewerLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 py-8 animate-in fade-in duration-300">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-8 w-56 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-3/4 max-w-xl animate-pulse rounded-full bg-slate-100" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-11 animate-pulse rounded-2xl bg-slate-100" />
          <div className="mt-3 h-11 animate-pulse rounded-2xl bg-slate-100" />
          <div className="mt-3 h-11 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-5 h-40 animate-pulse rounded-[20px] bg-slate-100" />
          <div className="mt-4 h-24 animate-pulse rounded-[20px] bg-slate-100" />
        </div>
      </section>
    </div>
  );
}
