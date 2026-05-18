import Link from "next/link";

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <i className="bx bxs-layer text-lg" aria-hidden />
            </span>
            <span className="text-sm font-black text-slate-800">
              HR<span className="text-indigo-600">LAB</span>
            </span>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500"
            aria-label="푸터 링크"
          >
            <a href="#features" className="hover:text-slate-900">
              기능
            </a>
            <a href="#showcase" className="hover:text-slate-900">
              화면
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
            <Link href="/login" className="hover:text-slate-900">
              로그인
            </Link>
            <a href="#contact" className="hover:text-slate-900">
              문의
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-slate-900">
              이용약관
            </a>
            <a href="#" className="hover:text-slate-900">
              개인정보처리방침
            </a>
          </nav>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          © {year} HR LAB. AI 기반 채용 운영 플랫폼.
        </p>
      </div>
    </footer>
  );
}
