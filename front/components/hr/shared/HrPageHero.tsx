import Link from "next/link";
import type { HrPageHeroProps, HrPageHeroTheme } from "@/types/hr-ui";

const THEME_STYLES: Record<
  HrPageHeroTheme,
  {
    section: string;
    blobA: string;
    blobB: string;
    badge: string;
    iconWrap: string;
    linkHover: string;
    linkIcon: string;
    statIcon: string;
  }
> = {
  indigo: {
    section:
      "border-slate-200/90 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50/40 shadow-indigo-100/40",
    blobA: "bg-indigo-400/[0.12]",
    blobB: "bg-violet-400/[0.1]",
    badge: "border-indigo-100/90 text-indigo-600",
    iconWrap:
      "bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-300/45",
    linkHover: "hover:border-indigo-200 hover:text-indigo-700",
    linkIcon: "text-indigo-500",
    statIcon: "bg-indigo-100 text-indigo-600",
  },
  amber: {
    section:
      "border-slate-200/90 bg-gradient-to-br from-white via-amber-50/70 to-rose-50/40 shadow-amber-100/50",
    blobA: "bg-amber-300/20",
    blobB: "bg-rose-300/15",
    badge: "border-amber-100 text-amber-700",
    iconWrap:
      "bg-gradient-to-br from-amber-500 to-rose-500 shadow-amber-200/70",
    linkHover: "hover:border-amber-200 hover:text-amber-700",
    linkIcon: "text-amber-500",
    statIcon: "bg-amber-100 text-amber-700",
  },
  emerald: {
    section:
      "border-slate-200/90 bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/40 shadow-emerald-100/40",
    blobA: "bg-emerald-400/[0.14]",
    blobB: "bg-teal-400/[0.1]",
    badge: "border-emerald-100 text-emerald-700",
    iconWrap:
      "bg-gradient-to-br from-emerald-600 to-teal-600 shadow-emerald-300/45",
    linkHover: "hover:border-emerald-200 hover:text-emerald-700",
    linkIcon: "text-emerald-500",
    statIcon: "bg-emerald-100 text-emerald-700",
  },
  sky: {
    section:
      "border-slate-200/90 bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/35 shadow-sky-100/45",
    blobA: "bg-sky-400/[0.14]",
    blobB: "bg-indigo-400/[0.1]",
    badge: "border-sky-100 text-sky-700",
    iconWrap: "bg-gradient-to-br from-sky-600 to-indigo-600 shadow-sky-300/45",
    linkHover: "hover:border-sky-200 hover:text-sky-700",
    linkIcon: "text-sky-500",
    statIcon: "bg-sky-100 text-sky-700",
  },
};

export default function HrPageHero({
  id = "hr-page-title",
  theme = "indigo",
  badge,
  title,
  description,
  icon,
  quickLinks,
  stats,
}: HrPageHeroProps) {
  const styles = THEME_STYLES[theme];

  return (
    <section
      className={`relative mb-4 shrink-0 overflow-hidden rounded-2xl border p-5 shadow-sm ring-1 ring-slate-900/[0.04] sm:mb-6 sm:rounded-3xl sm:p-6 lg:p-8 ${styles.section}`}
      aria-labelledby={id}
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full blur-3xl sm:-right-10 sm:h-44 sm:w-44 ${styles.blobA}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full blur-3xl ${styles.blobB}`}
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
          <p
            className={`inline-flex max-w-full items-center gap-2 rounded-full border bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] shadow-sm backdrop-blur-sm sm:text-[11px] ${styles.badge}`}
          >
            <i className={`bx bx-${badge.icon} shrink-0 text-sm leading-none`} />
            <span className="truncate">{badge.label}</span>
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ring-2 ring-white/60 sm:h-14 sm:w-14 sm:rounded-[1.125rem] ${styles.iconWrap}`}
            >
              <i className={`bx bx-${icon} text-2xl leading-none sm:text-[26px]`} />
            </div>
            <div className="min-w-0 space-y-3">
              <div className="space-y-2">
                <h1
                  id={id}
                  className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem] lg:leading-tight"
                >
                  {title}
                </h1>
                <div className="max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-[15px]">
                  {description}
                </div>
              </div>

              {quickLinks && quickLinks.length > 0 ? (
                <nav
                  className="flex flex-wrap gap-2 border-t border-slate-200/70 pt-3 sm:pt-4"
                  aria-label="관련 메뉴 바로가기"
                >
                  {quickLinks.map(({ href, label, icon: linkIcon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm backdrop-blur-sm transition active:scale-[0.98] ${styles.linkHover}`}
                    >
                      <i
                        className={`bx bx-${linkIcon} text-base ${styles.linkIcon}`}
                      />
                      {label}
                      <i className="bx bx-chevron-right -ml-0.5 text-sm text-slate-300" />
                    </Link>
                  ))}
                </nav>
              ) : null}
            </div>
          </div>
        </div>

        {stats && stats.length > 0 ? (
          <dl
            className={`grid shrink-0 gap-2 sm:gap-3 ${
              stats.length > 1
                ? "grid-cols-2 lg:w-[min(100%,280px)] lg:grid-cols-1"
                : "grid-cols-1 lg:w-[min(100%,240px)]"
            }`}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-4 sm:py-3.5"
              >
                {stat.icon ? (
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.statIcon}`}
                  >
                    <i className={`bx bx-${stat.icon} text-xl`} />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400 sm:text-[11px]">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 text-base font-black tabular-nums text-slate-900 sm:text-lg">
                    {stat.value}
                  </dd>
                  {stat.hint ? (
                    <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-500">
                      {stat.hint}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
