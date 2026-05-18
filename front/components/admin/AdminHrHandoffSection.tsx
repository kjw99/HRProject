import Link from "next/link";
import {
  ADMIN_HR_HANDOFF_CARDS,
  ADMIN_HOME_UI,
} from "./admin-home.constants";

const { hrSection } = ADMIN_HOME_UI;

export default function AdminHrHandoffSection() {
  return (
    <section className="space-y-4 rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50/40 p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-black text-slate-900">{hrSection.title}</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {hrSection.description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_HR_HANDOFF_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <i className={`bx bx-${card.icon} text-2xl`} />
            </span>
            <h3 className="mt-4 text-lg font-black text-slate-900">
              {card.title}
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              {card.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-emerald-600">
              {card.ctaLabel}
              <i className="bx bx-right-arrow-alt text-lg transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
