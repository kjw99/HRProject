import { TONES } from "@/types/hr";

interface PersonaConfigProps {
  tone: string;
  setTone: (val: string) => void;
  techWeight: number;
  setTechWeight: (val: number) => void;
  prompt: string;
  setPrompt: (val: string) => void;
}

export default function PersonaConfig({
  tone,
  setTone,
  techWeight,
  setTechWeight,
  prompt,
  setPrompt,
}: PersonaConfigProps) {
  return (
    <div className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col h-full">
      <div className="mb-8">
        <h3 className="text-[20px] font-black text-slate-900 flex items-center gap-3 mb-2">
          <i className="bx bx-slider text-2xl text-indigo-500"></i> 페르소나 및
          가중치
        </h3>
        <p className="text-[14px] text-slate-500 font-medium">
          AI 면접관의 질문 스타일과 평가 기준을 디테일하게 설정합니다.
        </p>
      </div>

      <div className="space-y-10">
        {/* 톤앤매너 - 깔끔한 라디오 카드 스타일 */}
        <div>
          <label className="block text-[12px] font-black text-slate-400 mb-4 uppercase tracking-widest">
            인터뷰 톤앤매너
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`flex flex-col items-start text-left p-5 rounded-[24px] border-2 transition-all duration-200 outline-none ${tone === t.id ? "border-indigo-500 bg-indigo-50/30 shadow-sm" : "border-slate-100 hover:border-slate-300 bg-white"}`}
              >
                <i
                  className={`bx ${t.icon} text-[24px] mb-3 ${tone === t.id ? "text-indigo-600" : "text-slate-400"}`}
                ></i>
                <h4
                  className={`font-bold text-[14px] mb-1 ${tone === t.id ? "text-indigo-900" : "text-slate-800"}`}
                >
                  {t.label}
                </h4>
                <p
                  className={`text-[12px] font-medium leading-snug ${tone === t.id ? "text-indigo-600/70" : "text-slate-400"}`}
                >
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 심플한 가중치 슬라이더 */}
        <div>
          <label className="block text-[12px] font-black text-slate-400 mb-5 uppercase tracking-widest">
            평가 기준 (Tech vs Culture)
          </label>
          <div className="px-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-bold text-slate-700">
                직무 역량 <span className="text-indigo-600">{techWeight}%</span>
              </span>
              <span className="text-[13px] font-bold text-slate-700">
                조직 적합성{" "}
                <span className="text-indigo-600">{100 - techWeight}%</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={techWeight}
              onChange={(e) => setTechWeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* 커스텀 프롬프트 */}
        <div>
          <label className="block text-[12px] font-black text-slate-400 mb-3 uppercase tracking-widest">
            시스템 프롬프트 (가드레일)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[24px] text-[14px] font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none h-[120px] transition-all leading-relaxed"
            placeholder="무엇이든 물어보세요..."
          />
        </div>
      </div>
    </div>
  );
}
