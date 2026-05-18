import Link from "next/link";
import {
  ADMIN_ACTION_CARDS,
  ADMIN_HOME_UI,
} from "./admin-home.constants";

const { adminSection } = ADMIN_HOME_UI;

export default function AdminAdminActionsSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-slate-900">
          {adminSection.title}
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {adminSection.description}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ADMIN_ACTION_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative overflow-hidden rounded-[24px] border-2 border-slate-800 bg-slate-950 p-5 text-white shadow-lg transition hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-xl"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 ${card.tone}`}
              aria-hidden
            />
            <div className="relative flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <i className={`bx bx-${card.icon} text-2xl`} />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-black">{card.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-200">
                  {card.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-indigo-200">
                  {card.ctaLabel}
                  <i className="bx bx-right-arrow-alt text-lg transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
