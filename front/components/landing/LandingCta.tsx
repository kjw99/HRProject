import Link from "next/link";

export default function LandingCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-6 py-14 text-center shadow-2xl shadow-indigo-900/30 sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-violet-500/25 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              지금 바로 채용 운영을 시작해 보세요
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-indigo-100/90 sm:text-base">
              로그인 후 HR 포털에서 부서·면접관 설정부터 AI 질문 생성, 일정 관리까지
              바로 이용할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-black text-slate-900 shadow-lg transition hover:bg-indigo-50 active:scale-[0.98] sm:w-auto"
              >
                로그인 / 시작하기
                <i className="bx bx-right-arrow-alt text-xl" aria-hidden />
              </Link>
              <a
                href="#contact"
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-base font-black text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto"
              >
                도입 문의
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
