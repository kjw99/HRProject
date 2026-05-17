import Link from "next/link";

const adminCards = [
  {
    title: "사용자 관리",
    description: "관리자와 HR 계정을 생성하고 비밀번호 재설정까지 처리합니다.",
    href: "/admin/users",
    icon: "user",
    tone: "from-indigo-600 to-violet-600",
  },
  {
    title: "접근 제어 규칙",
    description: "운영 중인 라우트의 접근 정책과 안내 문구를 정리합니다.",
    href: "/admin/routes",
    icon: "shield-quarter",
    tone: "from-sky-600 to-cyan-600",
  },
];

const hrHandoffCards = [
  {
    title: "지원자 운영",
    description: "지원자 정보 수정, 메일 발송, 전형 상태 확인 흐름입니다.",
    href: "/hr/applicants",
    icon: "group",
  },
  {
    title: "면접관 커뮤니케이션",
    description: "면접관 초대 링크 생성과 초대 메일 발송 화면입니다.",
    href: "/hr/interviewers/communication",
    icon: "send",
  },
  {
    title: "면접 일정",
    description: "면접 슬롯 생성과 예약 흐름을 다루는 HR 운영 화면입니다.",
    href: "/hr/schedule",
    icon: "calendar",
  },
];

export default function AdminHomeOverview() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-slate-300/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
              <i className="bx bx-shield-quarter text-sm" />
              Admin Overview
            </p>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                관리자 운영 허브
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                이 영역은 시스템 관리와 운영 권한 제어를 위한 관리자 전용
                화면입니다. HR 업무 화면은 별도 섹션으로 분리해 두었습니다.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
            <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Admin 영역
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">시스템 운영</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                HR 영역
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">채용 운영</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Boundary
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">역할 분리</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Admin 전용 작업</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            계정/접근 정책처럼 플랫폼 공통 규칙을 관리하는 영역입니다.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {adminCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${card.tone}`}
                >
                  <i className={`bx bx-${card.icon} text-2xl`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    {card.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-indigo-600">
                    열기
                    <i className="bx bx-right-arrow-alt text-lg transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">HR 운영 연결</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            아래 링크는 채용 운영 화면으로 이동합니다. UI는 분리되어 있지만
            관리자도 전체 흐름을 점검할 수 있도록 연결해 두었습니다.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {hrHandoffCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <i className={`bx bx-${card.icon} text-2xl`} />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">
                {card.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                {card.description}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-emerald-600">
                HR 화면 이동
                <i className="bx bx-right-arrow-alt text-lg transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
