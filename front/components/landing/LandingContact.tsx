import LandingContactForm from "./LandingContactForm";

export default function LandingContact() {
  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-slate-200/80 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Contact
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              도입·데모 문의
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
              팀 규모, 채용 프로세스, 연동 요구사항을 알려주시면 맞춤 안내를
              드립니다.
            </p>
            <ul className="mt-6 space-y-3 text-sm font-semibold text-slate-600">
              <li className="flex items-center gap-2">
                <i className="bx bx-check-circle text-lg text-emerald-500" aria-hidden />
                파일럿·PoC 도입 상담
              </li>
              <li className="flex items-center gap-2">
                <i className="bx bx-check-circle text-lg text-emerald-500" aria-hidden />
                HR / 면접관 역할별 데모
              </li>
              <li className="flex items-center gap-2">
                <i className="bx bx-check-circle text-lg text-emerald-500" aria-hidden />
                보안·권한 정책 관련 질의
              </li>
            </ul>
            <p className="mt-6 text-sm font-medium text-slate-500">
              이메일:{" "}
              <a
                href="mailto:hr@example.com"
                className="font-bold text-indigo-600 hover:underline"
              >
                hr@example.com
              </a>
            </p>
          </div>

          <LandingContactForm />
        </div>
      </div>
    </section>
  );
}
