import Link from "next/link";

const stats = [
  { value: "7", label: "운영 모듈", icon: "bx-grid-alt" },
  { value: "AI", label: "파싱·질문", icon: "bx-brain" },
  { value: "3", label: "역할 포털", icon: "bx-group" },
  { value: "24h", label: "예약 링크", icon: "bx-link-alt" },
] as const;

const highlights = [
  "이력서 파싱으로 지원자 정보를 구조화",
  "지원자·직무 맥락 기반 AI 질문 생성",
  "면접 슬롯·초대 링크·예약 현황 통합 관리",
] as const;

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-14 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-indigo-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-px max-w-3xl bg-linear-to-r from-transparent via-indigo-300/60 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8">
        <div className="text-center lg:text-left">
          <p className="animate-in fade-in slide-in-from-bottom-4 inline-flex items-center gap-2 rounded-full border border-indigo-100/90 bg-white/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-indigo-600 shadow-sm backdrop-blur-sm duration-700">
            <i className="bx bxs-magic-wand text-sm" aria-hidden />
            AI-Powered Recruitment Operations
          </p>

          <h1 className="animate-in fade-in slide-in-from-bottom-6 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.12] tracking-tight text-slate-900 delay-75 duration-700 fill-mode-both sm:text-5xl lg:mx-0 lg:text-[3.35rem]">
            이력서부터 면접 예약까지
            <span className="mt-1 block bg-linear-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              채용 운영을 한 번에
            </span>
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-6 mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-600 delay-150 duration-700 fill-mode-both sm:text-lg lg:mx-0">
            HR LAB은 이력서 파싱, 지원자 관리, AI 면접 질문, 일정·면접관 배정,
            예약 링크 발송까지 실제 채용 프로세스를 하나의 포털로 연결합니다.
          </p>

          <ul className="mx-auto mt-6 grid max-w-2xl gap-2 text-left sm:grid-cols-3 lg:mx-0">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-2xl border border-white/80 bg-white/70 px-3 py-3 text-xs font-bold leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-900/[0.03] backdrop-blur-sm"
              >
                <i className="bx bx-check-circle mt-0.5 text-base text-emerald-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="animate-in fade-in slide-in-from-bottom-6 mt-9 flex flex-col items-center justify-center gap-3 delay-200 duration-700 fill-mode-both sm:flex-row sm:gap-4 lg:justify-start">
            <Link
              href="/login"
              className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-indigo-300/40 transition hover:-translate-y-0.5 hover:shadow-indigo-400/50 active:scale-[0.98] sm:w-auto sm:max-w-none"
            >
              HR 포털 시작하기
              <i className="bx bx-right-arrow-alt text-xl transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#workflow"
              className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto sm:max-w-none"
            >
              <i className="bx bx-play-circle text-xl text-indigo-500" aria-hidden />
              운영 흐름 보기
            </a>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 delay-300 duration-700 fill-mode-both">
          <div className="relative mx-auto max-w-xl rounded-[2rem] border border-white/80 bg-white/75 p-3 shadow-2xl shadow-indigo-200/40 ring-1 ring-slate-900/[0.04] backdrop-blur-sm lg:mx-0">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-950 p-4 text-left text-white">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-200">
                    Live Hiring Flow
                  </p>
                  <h2 className="mt-1 text-lg font-black">오늘의 채용 운영</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-black text-emerald-200">
                  진행 중
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold text-slate-300">이력서 파싱</p>
                  <p className="mt-2 text-2xl font-black">32건</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-4/5 rounded-full bg-linear-to-r from-cyan-300 to-indigo-300" />
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold text-slate-300">예약 확정</p>
                  <p className="mt-2 text-2xl font-black">14건</p>
                  <div className="mt-4 flex -space-x-2">
                    {["HR", "AI", "IV", "OK"].map((label) => (
                      <span
                        key={label}
                        className="grid h-8 w-8 place-items-center rounded-full border border-slate-950 bg-white text-[10px] font-black text-indigo-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(({ value, label, icon }) => (
                  <div key={label} className="rounded-2xl bg-white px-3 py-4 text-slate-900">
                    <i className={`bx ${icon} mb-2 text-xl text-indigo-500`} aria-hidden />
                    <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-xl font-black tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
