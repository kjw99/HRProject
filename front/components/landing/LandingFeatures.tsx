const features = [
  {
    icon: "bx-file-find",
    tone: "blue",
    title: "이력서 & JD 파싱",
    description:
      "지원서와 직무 기술서를 교차 분석해 핵심 역량·적합도를 구조화합니다.",
    span: "sm:col-span-1",
  },
  {
    icon: "bx-brain",
    tone: "indigo",
    title: "AI 면접 질문 생성",
    description:
      "지원자·직무 맥락 기반으로 평가 의도와 꼬리 질문을 자동 생성하고 저장합니다.",
    span: "sm:col-span-2 lg:col-span-1",
    highlight: true,
  },
  {
    icon: "bx-list-ul",
    tone: "violet",
    title: "질문 라이브러리",
    description:
      "부서별로 저장된 질문을 조회·관리하고, 면접 전에 빠르게 활용합니다.",
    span: "sm:col-span-1",
  },
  {
    icon: "bx-calendar-check",
    tone: "emerald",
    title: "면접 일정 & 예약",
    description:
      "슬롯 생성, 면접관 배정, 지원자 초대 링크·예약까지 한 흐름으로 처리합니다.",
    span: "sm:col-span-1",
  },
  {
    icon: "bx-user-voice",
    tone: "amber",
    title: "면접관·부서 관리",
    description:
      "직무(부서), 면접 차수, 면접관 이메일 검증 등 조직 단위 설정을 지원합니다.",
    span: "sm:col-span-1",
  },
  {
    icon: "bx-grid-alt",
    tone: "slate",
    title: "HR 대시보드",
    description:
      "부서별 채용 현황과 일정을 한눈에 보고, 다음 액션으로 바로 이어갑니다.",
    span: "sm:col-span-2 lg:col-span-1",
  },
] as const;

const toneClasses = {
  blue: {
    icon: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    glow: "from-blue-100/80 to-indigo-50/40",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
    glow: "from-indigo-200/60 to-violet-100/40",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
    glow: "from-violet-100/80 to-fuchsia-50/40",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    glow: "from-emerald-100/80 to-teal-50/40",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
    glow: "from-amber-100/80 to-orange-50/40",
  },
  slate: {
    icon: "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white",
    glow: "from-slate-200/60 to-slate-100/40",
  },
} as const;

export default function LandingFeatures() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-slate-200/80 bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            채용 운영에 필요한 기능을 한곳에
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
            파싱부터 면접 질문, 일정, 예약까지 실제 HR 포털에 구현된 모듈을
            소개합니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((feature) => {
            const tone = toneClasses[feature.tone];
            return (
              <article
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:-translate-y-1 hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/30 ${feature.span} ${
                  "highlight" in feature && feature.highlight
                    ? "lg:scale-[1.02] lg:border-indigo-100 lg:shadow-md"
                    : ""
                }`}
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${tone.glow} opacity-60 blur-2xl transition group-hover:opacity-100`}
                  aria-hidden
                />
                <div
                  className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition ${tone.icon}`}
                >
                  <i className={`bx ${feature.icon} text-2xl`} aria-hidden />
                </div>
                <h3 className="relative text-lg font-black text-slate-900">
                  {feature.title}
                </h3>
                <p className="relative mt-2 text-sm font-medium leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
