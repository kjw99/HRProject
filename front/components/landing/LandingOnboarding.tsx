import Link from "next/link";

const steps = [
  {
    time: "1분",
    title: "부서·면접관 설정",
    text: "직무(부서)를 등록하고 면접관을 배정합니다.",
    href: "/hr/positions",
    icon: "bx-buildings",
  },
  {
    time: "1분",
    title: "AI 질문 생성·저장",
    text: "지원자를 선택해 질문을 만들고 라이브러리에 저장합니다.",
    href: "/hr/ai-gen",
    icon: "bx-brain",
  },
  {
    time: "1분",
    title: "일정·초대",
    text: "면접 슬롯을 만들고 지원자에게 예약 링크를 보냅니다.",
    href: "/hr/schedule",
    icon: "bx-calendar",
  },
] as const;

export default function LandingOnboarding() {
  return (
    <section
      id="onboarding"
      className="scroll-mt-24 border-t border-slate-200/80 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Quick Start
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              3분 온보딩 가이드
            </h2>
            <p className="mt-3 text-base font-medium text-slate-500">
              로그인 후 아래 순서대로 진행하면 첫 채용 사이클을 바로 돌려볼 수
              있습니다.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            지금 시작하기
            <i className="bx bx-right-arrow-alt text-lg" aria-hidden />
          </Link>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Link
                href={step.href}
                className="group flex h-full flex-col rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 transition hover:border-indigo-200 hover:bg-white hover:shadow-md"
              >
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-500">
                  STEP {index + 1} · {step.time}
                </span>
                <span className="mt-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/80 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <i className={`bx ${step.icon} text-xl`} aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-black text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-sm font-medium text-slate-500">
                  {step.text}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-indigo-600">
                  바로가기
                  <i className="bx bx-chevron-right text-base transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
