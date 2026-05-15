import Link from "next/link";

const stats = [
  { value: "6+", label: "핵심 모듈", icon: "bx-grid-alt" },
  { value: "AI", label: "맞춤 질문 생성", icon: "bx-brain" },
  { value: "3", label: "역할별 포털", icon: "bx-group" },
] as const;

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-indigo-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 inline-flex items-center gap-2 rounded-full border border-indigo-100/90 bg-white/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-indigo-600 shadow-sm backdrop-blur-sm">
          <i className="bx bxs-magic-wand text-sm" aria-hidden />
          AI-Powered Recruitment Platform
        </p>

        <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-75 fill-mode-both mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
          채용의 모든 순간을
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
            하나의 흐름으로 연결합니다
          </span>
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
          이력서 파싱, AI 면접 질문, 일정·면접관 관리, 지원자 예약까지.
          <br className="hidden sm:block" />
          HR 담당자는 판단에, 시스템은 반복 업무에 집중하도록 설계했습니다.
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/login"
            className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-indigo-300/40 transition hover:shadow-indigo-400/50 hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto sm:max-w-none"
          >
            무료로 시작하기
            <i className="bx bx-right-arrow-alt text-xl transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#features"
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto sm:max-w-none"
          >
            <i className="bx bx-play-circle text-xl text-indigo-500" aria-hidden />
            기능 살펴보기
          </a>
        </div>

        <dl className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both mt-14 grid grid-cols-3 gap-3 sm:mx-auto sm:max-w-xl sm:gap-4">
          {stats.map(({ value, label, icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/80 bg-white/70 px-3 py-4 shadow-sm ring-1 ring-slate-900/[0.04] backdrop-blur-sm sm:px-4 sm:py-5"
            >
              <i className={`bx ${icon} mb-2 text-2xl text-indigo-500`} aria-hidden />
              <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400 sm:text-[11px]">
                {label}
              </dt>
              <dd className="mt-0.5 text-xl font-black tabular-nums text-slate-900 sm:text-2xl">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
