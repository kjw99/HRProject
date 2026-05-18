export default function ApplicantLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-7 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-full bg-slate-100" />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100 sm:col-span-2" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100 sm:col-span-2" />
        </div>
      </section>
    </div>
  );
}
