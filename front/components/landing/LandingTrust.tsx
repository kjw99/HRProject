const metrics = [
  { value: "7개", label: "채용 운영 모듈", hint: "파싱·지원자·일정" },
  { value: "1곳", label: "채용 데이터 통합", hint: "질문·예약·메일" },
  { value: "3", label: "역할 기반 접근", hint: "HR · 면접관 · 지원자" },
] as const;

const securityItems = [
  {
    icon: "bx-shield-quarter",
    title: "역할 기반 접근 제어",
    text: "Admin / HR / 면접관별 API·화면 권한을 분리합니다.",
  },
  {
    icon: "bx-lock-alt",
    title: "인증·세션",
    text: "JWT 기반 로그인으로 보호된 API만 호출합니다.",
  },
  {
    icon: "bx-user-check",
    title: "면접관·지원자 격리",
    text: "담당 직무·차수 밖 데이터는 조회·수정할 수 없습니다.",
  },
] as const;

export default function LandingTrust() {
  return (
    <section className="border-t border-slate-200/80 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Trust & Security
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              운영 효율과 보안을 함께
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
              반복 업무는 자동화하고, 민감한 채용 데이터는 역할·권한으로
              보호합니다.
            </p>
            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 text-center"
                >
                  <dd className="text-xl font-black text-indigo-600 sm:text-2xl">
                    {m.value}
                  </dd>
                  <dt className="mt-1 text-[10px] font-bold text-slate-700 sm:text-xs">
                    {m.label}
                  </dt>
                  <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                    {m.hint}
                  </p>
                </div>
              ))}
            </dl>
          </div>

          <ul className="space-y-3">
            {securityItems.map((item) => (
              <li
                key={item.title}
                className="flex gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <i className={`bx ${item.icon} text-xl`} aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
