function MockDashboard() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded-lg bg-indigo-100" />
        <div className="h-8 w-20 rounded-lg bg-slate-100" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
            <div className="h-2 w-8 rounded bg-slate-200" />
            <div className="mt-2 h-6 rounded bg-indigo-100" />
          </div>
        ))}
      </div>
      <div className="h-24 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100" />
    </div>
  );
}

function MockAiGen() {
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      <div className="space-y-2 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-100">
        <div className="h-2 w-12 rounded bg-slate-300" />
        <div className="h-16 rounded-lg bg-white" />
        <div className="h-6 rounded-lg bg-indigo-600/80" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-100">
            <div className="h-2 w-full rounded bg-slate-200" />
            <div className="mt-1.5 h-2 w-3/4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MockSchedule() {
  return (
    <div className="p-4">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-md bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-md ${
              i === 5 || i === 9 ? "bg-indigo-500" : "bg-slate-50 ring-1 ring-slate-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const screens = [
  {
    label: "HR 대시보드",
    icon: "bx-grid-alt",
    description: "부서별 채용·일정 현황을 한 화면에서 확인합니다.",
    accent: "from-indigo-500/20 to-violet-500/10",
    Mock: MockDashboard,
  },
  {
    label: "AI 질문 생성",
    icon: "bx-brain",
    description: "지원자·직무 맥락으로 면접 질문과 평가 의도를 생성합니다.",
    accent: "from-violet-500/20 to-fuchsia-500/10",
    Mock: MockAiGen,
  },
  {
    label: "면접 일정",
    icon: "bx-calendar",
    description: "슬롯·면접관·지원자 예약을 캘린더로 통합 관리합니다.",
    accent: "from-cyan-500/20 to-blue-500/10",
    Mock: MockSchedule,
  },
] as const;

export default function LandingShowcase() {
  return (
    <section
      id="showcase"
      className="scroll-mt-24 border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Product
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            실제 포털 화면 구성
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
            HR LAB에 구현된 주요 화면입니다. 로그인 후 동일한 흐름으로 이용할 수
            있습니다.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {screens.map(({ label, icon, description, accent, Mock }) => (
            <article
              key={label}
              className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-900/[0.03]"
            >
              <div
                className={`border-b border-slate-100 bg-gradient-to-br ${accent} px-5 py-4`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <i className={`bx ${icon} text-xl`} aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{label}</h3>
                    <p className="text-xs font-medium text-slate-500">{description}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50/80">
                <div className="mx-3 mt-3 flex items-center gap-1.5 rounded-t-xl bg-slate-200/80 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="ml-2 h-2 flex-1 max-w-[120px] rounded bg-white/80" />
                </div>
                <div className="mx-3 mb-3 min-h-[180px] rounded-b-xl bg-white ring-1 ring-slate-200/80">
                  <Mock />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
