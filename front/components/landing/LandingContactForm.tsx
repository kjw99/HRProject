"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

const INQUIRY_TYPES = ["도입 상담", "데모 요청", "기술·보안 문의", "기타"] as const;

export default function LandingContactForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] =
    useState<(typeof INQUIRY_TYPES)[number]>("도입 상담");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("이름, 이메일, 문의 내용을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    const subject = encodeURIComponent(`[HR LAB] ${inquiryType} - ${company || name}`);
    const body = encodeURIComponent(
      `이름: ${name}\n회사: ${company || "-"}\n이메일: ${email}\n문의 유형: ${inquiryType}\n\n${message}`,
    );
    window.location.href = `mailto:hr@example.com?subject=${subject}&body=${body}`;
    toast.success("메일 앱이 열립니다. 전송을 완료해 주세요.");
    setIsSubmitting(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
            이름 *
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
              placeholder="홍길동"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
            회사명
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
              placeholder="(주)예시"
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
          이메일 *
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
            placeholder="you@company.com"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
          문의 유형
          <select
            value={inquiryType}
            onChange={(e) =>
              setInquiryType(e.target.value as (typeof INQUIRY_TYPES)[number])
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
          >
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
          문의 내용 *
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
            placeholder="도입 규모, 일정, 궁금한 점을 적어 주세요."
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <i className="bx bx-send text-lg" aria-hidden />
          문의 보내기
        </button>
      </form>

      <p className="mt-4 text-center text-xs font-medium text-slate-400">
        또는{" "}
        <Link href="/login" className="font-bold text-indigo-600 hover:underline">
          로그인
        </Link>
        후 직접 체험해 보세요.
      </p>
    </div>
  );
}
