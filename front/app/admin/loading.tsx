function AdminPanelSkeleton() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
        <div className="flex-1">
          <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/50 p-6 shadow-sm sm:p-8">
        <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-10 w-56 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanelSkeleton />
        <AdminPanelSkeleton />
      </div>
    </div>
  );
}
