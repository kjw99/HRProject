import Link from "next/link";

const navLinks = [
  { href: "#features", label: "기능" },
  { href: "#showcase", label: "화면" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "문의" },
] as const;

export default function LandingHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-300/40 ring-2 ring-white/60">
            <i className="bx bxs-layer text-lg leading-none" aria-hidden />
          </span>
          <span className="truncate text-lg font-black tracking-tight text-slate-900">
            HR<span className="text-indigo-600">LAB</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="주요 메뉴"
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href="#contact"
            className="hidden rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          >
            도입 문의
          </a>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white shadow-md shadow-slate-900/15 transition hover:bg-slate-800 active:scale-[0.98] sm:px-5"
          >
            로그인
            <i
              className="bx bx-right-arrow-alt text-lg transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
