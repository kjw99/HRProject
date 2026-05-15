"use client";

import { useState } from "react";

const faqs = [
  {
    q: "지원자는 어떻게 면접을 예약하나요?",
    a: "HR이 발송한 초대 링크로 접속해, 열어둔 슬롯 중 원하는 시간을 선택합니다. 별도 계정 없이 토큰 기반으로 예약할 수 있습니다.",
  },
  {
    q: "AI가 만든 질문은 저장되나요?",
    a: "네. 생성한 질문은 부서(직무)별 질문 라이브러리에 저장되며, 질문 조회 화면에서 다시 확인·삭제할 수 있습니다.",
  },
  {
    q: "면접관은 다른 부서 질문을 볼 수 있나요?",
    a: "면접관 포털은 본인에게 배정된 직무·차수 범위 내 데이터만 조회·생성할 수 있도록 제한됩니다.",
  },
  {
    q: "이력서 파싱은 어떤 형식을 지원하나요?",
    a: "HR 포털의 이력서 파싱 메뉴에서 업로드·분석 흐름을 제공합니다. 지원 형식은 서비스 설정에 따릅니다.",
  },
  {
    q: "도입 문의는 어떻게 하나요?",
    a: "하단 문의 섹션에서 내용을 남기시거나, 로그인 후 파일럿 환경에서 직접 체험해 보실 수 있습니다.",
  },
] as const;

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            자주 묻는 질문
          </h2>
        </div>

        <ul className="mt-10 space-y-2">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <li key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-5 py-4 text-left shadow-sm transition hover:border-indigo-100"
                  aria-expanded={open}
                >
                  <span className="text-sm font-black text-slate-900 sm:text-base">
                    {faq.q}
                  </span>
                  <i
                    className={`bx bx-chevron-down shrink-0 text-xl text-slate-400 transition ${
                      open ? "rotate-180 text-indigo-600" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                {open ? (
                  <div className="mx-2 mt-1 rounded-b-2xl border border-t-0 border-slate-200/90 bg-white px-5 pb-4 pt-2">
                    <p className="text-sm font-medium leading-relaxed text-slate-600">
                      {faq.a}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
