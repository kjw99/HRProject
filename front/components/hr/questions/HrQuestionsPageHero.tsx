import Link from "next/link";

interface HrQuestionsPageHeroProps {
  departmentCount: number;
}

const quickLinks = [
  { href: "/hr", label: "대시보드", icon: "bx-grid-alt" },
  { href: "/hr/ai-gen", label: "AI 질문 생성", icon: "bx-brain" },
  { href: "/hr/positions", label: "부서 관리", icon: "bx-buildings" },
] as const;

export default function HrQuestionsPageHero({
  departmentCount,
}: HrQuestionsPageHeroProps) {
  return (
    <section
      className="relative mb-4 shrink-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50/40 p-5 shadow-sm shadow-indigo-100/40 ring-1 ring-slate-900/[0.04] sm:mb-6 sm:rounded-3xl sm:p-6 lg:p-8"
      aria-labelledby="hr-questions-page-title"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-indigo-400/[0.12] blur-3xl sm:-right-10 sm:h-44 sm:w-44"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-violet-400/[0.1] blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-100/90 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 shadow-sm backdrop-blur-sm sm:text-[11px]">
            <i className="bx bx-list-ul shrink-0 text-sm leading-none" />
            <span className="truncate">HR · 질문 라이브러리</span>
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-300/45 ring-2 ring-white/60 sm:h-14 sm:w-14 sm:rounded-[1.125rem]">
              <i className="bx bx-message-dots text-2xl leading-none sm:text-[26px]" />
            </div>
            <div className="min-w-0 space-y-3">
              <div className="space-y-2">
                <h1
                  id="hr-questions-page-title"
                  className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem] lg:leading-tight"
                >
                  질문 조회
                </h1>
                <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-600 sm:text-[15px]">
                  <i className="bx bx-info-circle mr-1 inline-block align-text-bottom text-indigo-500" />
                  부서(직무)를 선택하면 저장된 면접 질문을 확인할 수 있습니다. 목록은
                  스크롤 시 순차적으로 불러옵니다.
                </p>
              </div>

              <nav
                className="flex flex-wrap gap-2 border-t border-slate-200/70 pt-3 sm:pt-4"
                aria-label="관련 메뉴 바로가기"
              >
                {quickLinks.map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm backdrop-blur-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-700 active:scale-[0.98]"
                  >
                    <i className={`bx ${icon} text-base text-indigo-500`} />
                    {label}
                    <i className="bx bx-chevron-right -ml-0.5 text-sm text-slate-300" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <dl className="grid shrink-0 grid-cols-1 gap-2 sm:gap-3 lg:w-[min(100%,240px)]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-4 sm:py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <i className="bx bx-buildings text-xl" />
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400 sm:text-[11px]">
                선택 가능 부서
              </dt>
              <dd className="text-lg font-black tabular-nums text-slate-900 sm:text-xl">
                {departmentCount}
                <span className="ml-0.5 text-xs font-bold text-slate-400 sm:text-sm">
                  개
                </span>
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </section>
  );
}
