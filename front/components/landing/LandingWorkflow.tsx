const steps = [
  {
    step: "01",
    icon: "bx-upload",
    title: "이력서 파싱",
    description: "업로드한 이력서에서 인적사항, 경력, 스킬을 추출해 지원자 DB에 등록합니다.",
  },
  {
    step: "02",
    icon: "bx-id-card",
    title: "지원자 검토",
    description: "지원자 상세, 우대조건, 직무 정보를 확인하고 필요한 정보를 보정합니다.",
  },
  {
    step: "03",
    icon: "bx-brain",
    title: "AI 질문 생성",
    description: "지원자·직무 맥락을 바탕으로 질문과 평가 의도, 근거를 생성합니다.",
  },
  {
    step: "04",
    icon: "bx-calendar-plus",
    title: "일정·초대 발송",
    description: "면접 슬롯과 면접관을 연결하고 지원자에게 예약 링크를 보냅니다.",
  },
  {
    step: "05",
    icon: "bx-check-circle",
    title: "예약·현황 추적",
    description: "지원자가 시간을 선택하면 HR 대시보드에서 예약과 면접 일정을 추적합니다.",
  },
] as const;

export default function LandingWorkflow() {
  return (
    <section
      id="workflow"
      className="scroll-mt-24 bg-linear-to-b from-slate-50 to-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            채용 프로세스를 5단계로
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
            이력서 등록부터 면접 예약 확정까지, 흐름이 끊기지 않도록 설계했습니다.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {steps.map((item, index) => (
            <li key={item.step} className="relative">
              {index < steps.length - 1 ? (
                <span
                  className="absolute left-[calc(50%+2rem)] top-10 hidden h-px w-[calc(100%-4rem)] bg-linear-to-r from-indigo-200 to-transparent lg:block"
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
