function HrCardSkeleton() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 h-7 w-48 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-100" />
      <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}

export default function HrLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-indigo-50/60 to-emerald-50/50 p-6 shadow-sm sm:p-8">
        <div className="h-5 w-32 animate-pulse rounded-full bg-white/80" />
        <div className="mt-4 h-10 w-64 animate-pulse rounded-full bg-white/90" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/80" />
        <div className="mt-2 h-4 w-3/4 max-w-xl animate-pulse rounded-full bg-white/70" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-20 animate-pulse rounded-2xl bg-white/80" />
          <div className="h-20 animate-pulse rounded-2xl bg-white/80" />
          <div className="h-20 animate-pulse rounded-2xl bg-white/80" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <HrCardSkeleton />
        <HrCardSkeleton />
      </div>
    </div>
  );
}
