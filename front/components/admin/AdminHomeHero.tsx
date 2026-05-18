import AdminHomeMetrics from "./AdminHomeMetrics";
import { ADMIN_HOME_UI } from "./admin-home.constants";
import type { AdminHomeMetricsProps } from "@/types/admin-ui";

const { hero } = ADMIN_HOME_UI;

export default function AdminHomeHero({
  initialUserCount,
}: AdminHomeMetricsProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border-2 border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-6">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-300">
            <i className="bx bx-shield-quarter text-sm" />
            {hero.badge}
          </p>
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {hero.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
              {hero.description}
            </p>
          </div>
        </div>
        <AdminHomeMetrics initialUserCount={initialUserCount} />
      </div>
    </section>
  );
}
