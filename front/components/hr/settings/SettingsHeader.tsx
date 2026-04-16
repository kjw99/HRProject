export default function SettingsHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-black uppercase tracking-[0.15em]">
          <i className="bx bx-cog text-sm"></i> Configuration
        </div>
        <h2 className="text-[28px] md:text-[34px] font-black text-slate-900 tracking-tight leading-tight">
          에이전트 환경 설정
        </h2>
        <p className="text-slate-500 font-medium text-[14px] md:text-[15px] max-w-2xl leading-relaxed">
          AI 면접관의 지식 범위(RAG)를 확장하고 질문 성향(Persona)을 튜닝하여,{" "}
          <br className="hidden md:block" />
          우리 기업에 최적화된 채용 에이전트를 구축하세요.
        </p>
      </div>
      <button className="px-7 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[14px]">
        <i className="bx bx-save text-lg"></i> 설정 배포하기
      </button>
    </header>
  );
}
