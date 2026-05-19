import Link from "next/link";

const roles = [
  {
    icon: "bx-buildings",
    badge: "HR · Admin",
    title: "인사·채용 담당자",
    description:
      "대시보드, 지원자 관리, 부서·면접관 설정, AI 질문, 일정·초대를 운영합니다.",
    href: "/login",
    cta: "HR 포털 로그인",
    accent: "from-indigo-600 to-violet-600",
  },
  {
    icon: "bx-user-voice",
    badge: "Interviewer",
    title: "면접관",
    description:
      "담당 직무·차수에 맞는 질문 생성·저장과 참여 가능 일정 응답을 지원합니다.",
    href: "/login",
    cta: "면접관 로그인",
    accent: "from-violet-600 to-fuchsia-600",
  },
  {
    icon: "bx-user",
    badge: "Applicant",
    title: "지원자",
    description:
      "초대 링크로 면접 가능 슬롯을 확인하고, 원하는 시간에 일정을 예약합니다.",
    href: "/interview-booking",
    cta: "면접 예약 안내",
    accent: "from-cyan-600 to-blue-600",
  },
] as const;

export default function LandingRoles() {
  return (
    <section id="roles" className="scroll-mt-24 border-t border-slate-200/80 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Portals
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            역할별로 나뉜 포털
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
            같은 데이터를 HR, 면접관, 지원자 각각에 맞는 화면으로 제공합니다.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {roles.map((role) => (
            <article
              key={role.title}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/50 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:-translate-y-1 hover:border-indigo-100 hover:bg-white hover:shadow-lg"
            >
              <div className={`bg-linear-to-r ${role.accent} px-6 py-5 text-white`}>
                <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                  {role.badge}
                </span>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <i className={`bx ${role.icon} text-2xl`} aria-hidden />
                  </span>
                  <h3 className="text-lg font-black">{role.title}</h3>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="flex-1 text-sm font-medium leading-relaxed text-slate-600">
                  {role.description}
                </p>
                <Link
                  href={role.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-indigo-600 transition hover:text-indigo-800"
                >
                  {role.cta}
                  <i className="bx bx-chevron-right text-lg" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
