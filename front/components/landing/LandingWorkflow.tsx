const steps = [
  {
    step: "01",
    icon: "bx-upload",
    title: "지원·직무 데이터 수집",
    description: "이력서 파싱과 직무(부서) 등록으로 평가 기준을 맞춥니다.",
  },
  {
    step: "02",
    icon: "bx-brain",
    title: "AI 질문 생성·저장",
    description: "지원자별 맞춤 질문을 만들고 부서 질문 라이브러리에 쌓습니다.",
  },
  {
    step: "03",
    icon: "bx-calendar-plus",
    title: "일정·면접관 배정",
    description: "슬롯을 만들고 면접관을 연결한 뒤 초대 링크를 발송합니다.",
  },
  {
    step: "04",
    icon: "bx-check-circle",
    title: "지원자 예약·면접 진행",
    description: "지원자가 슬롯을 선택하고, HR은 대시보드에서 현황을 추적합니다.",
  },
] as const;

export default function LandingWorkflow() {
  return (
    <section
      id="workflow"
      className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            채용 프로세스를 4단계로
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
            데이터 입력부터 면접 당일까지, 흐름이 끊기지 않도록 설계했습니다.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <li key={item.step} className="relative">
              {index < steps.length - 1 ? (
                <span
                  className="absolute left-[calc(50%+2rem)] top-10 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-indigo-200 to-transparent lg:block"
                  aria-hidden
                />
              ) : null}
              <article className="flex h-full flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:border-indigo-100 hover:shadow-md">
                <span className="text-[11px] font-black tabular-nums text-indigo-500">
                  STEP {item.step}
                </span>
                <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <i className={`bx ${item.icon} text-2xl`} aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-black text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
