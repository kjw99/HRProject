const features = [
  {
    icon: "bx-file-find",
    tone: "blue",
    title: "AI 이력서 파싱",
    description:
      "PDF · DOCX · HWP 이력서를 업로드하면 인적사항, 경력, 스킬을 구조화합니다.",
  },
  {
    icon: "bx-id-card",
    tone: "cyan",
    title: "지원자 관리",
    description:
      "검색, 상세 조회, 우대조건 확인, 수정·삭제, 메일 발송까지 한 화면에서 처리합니다.",
  },
  {
    icon: "bx-brain",
    tone: "indigo",
    title: "AI 면접 질문 생성",
    description:
      "지원자·직무 맥락 기반으로 평가 의도와 생성 근거가 담긴 질문을 만듭니다.",
  },
  {
    icon: "bx-calendar-check",
    tone: "emerald",
    title: "면접 일정·예약 링크",
    description:
      "캘린더에서 슬롯을 만들고 지원자가 초대 링크로 직접 시간을 예약합니다.",
  },
  {
    icon: "bx-list-ul",
    tone: "violet",
    title: "질문 라이브러리",
    description:
      "부서별로 저장된 질문을 조회·관리하고 면접 전 필요한 질문을 빠르게 정리합니다.",
  },
  {
    icon: "bx-user-voice",
    tone: "amber",
    title: "면접관 커뮤니케이션",
    description:
      "면접관의 담당 직무·차수를 관리하고 참여 가능 일정과 안내 메일을 연결합니다.",
  },
  {
    icon: "bx-envelope",
    tone: "rose",
    title: "메일 템플릿",
    description:
      "예약 안내, 면접관 초대, 지원자 연락에 쓰는 템플릿과 변수를 관리합니다.",
  },
  {
    icon: "bx-grid-alt",
    tone: "slate",
    title: "HR 대시보드",
    description:
      "오늘 면접, 전체 지원자, 진행 중 직무, 부서별 현황을 한눈에 확인합니다.",
  },
] as const;

const toneClasses = {
  blue: {
    icon: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    glow: "from-blue-100/80 to-indigo-50/40",
  },
  cyan: {
    icon: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
    glow: "from-cyan-100/80 to-blue-50/40",
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
  rose: {
    icon: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
    glow: "from-rose-100/80 to-pink-50/40",
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
            파싱부터 지원자 관리, 질문 생성, 일정 예약, 메일 템플릿까지 실제
            HR 포털에 구현된 모듈을 소개합니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-5">
          {features.map((feature) => {
            const tone = toneClasses[feature.tone];
            return (
              <article
                key={feature.title}
                className="group relative min-h-[210px] overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:-translate-y-1 hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/30"
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br ${tone.glow} opacity-60 blur-2xl transition group-hover:opacity-100`}
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
