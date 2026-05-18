const rows = [
  { label: "이력서·JD 분석", manual: "수기 검토", lab: "자동 파싱·구조화" },
  { label: "면접 질문", manual: "엑셀·문서 공유", lab: "AI 생성 + 부서별 라이브러리" },
  { label: "일정 조율", manual: "메일·메신저 반복", lab: "슬롯·초대 링크·예약" },
  { label: "면접관 배정", manual: "별도 시트 관리", lab: "직무·차수 연동" },
  { label: "권한 관리", manual: "제한적", lab: "역할별 포털·API" },
] as const;

export default function LandingCompare() {
  return (
    <section
      id="compare"
      className="scroll-mt-24 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Compare
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            수기 운영 vs HR LAB
          </h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 sm:text-xs">
            <div className="px-4 py-3 sm:px-6">항목</div>
            <div className="border-l border-slate-100 px-4 py-3 sm:px-6">
              기존 방식
            </div>
            <div className="border-l border-slate-100 bg-indigo-50/50 px-4 py-3 text-indigo-700 sm:px-6">
              HR LAB
            </div>
          </div>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_1fr_1fr] text-sm ${
                i < rows.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="px-4 py-4 font-bold text-slate-800 sm:px-6">
                {row.label}
              </div>
              <div className="border-l border-slate-100 px-4 py-4 font-medium text-slate-500 sm:px-6">
                {row.manual}
              </div>
              <div className="border-l border-slate-100 bg-indigo-50/30 px-4 py-4 font-bold text-indigo-800 sm:px-6">
                {row.lab}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
