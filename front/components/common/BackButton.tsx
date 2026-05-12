"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6 group w-fit pr-4"
    >
      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:bg-slate-50 group-hover:border-slate-300 transition-all">
        <i className="bx bx-arrow-back text-lg group-hover:-translate-x-0.5 transition-transform"></i>
      </div>
      이전으로 돌아가기
    </button>
  );
}
