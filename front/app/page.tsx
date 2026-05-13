import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4">
      <h1 className="text-2xl font-semibold text-slate-900">HI</h1>
      <Link
        href="/login"
        className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        로그인
      </Link>
    </div>
  );
}
