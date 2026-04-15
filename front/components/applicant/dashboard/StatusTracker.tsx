const STAGES = [
  { id: 1, title: "서류 접수", icon: "bx-file" },
  { id: 2, title: "AI 역량 검사", icon: "bx-brain" },
  { id: 3, title: "심층 면접", icon: "bx-conversation" },
  { id: 4, title: "최종 결과", icon: "bx-party" },
];

export default function StatusTracker({
  currentStage,
}: {
  currentStage: number;
}) {
  return (
    <div className="relative pt-4 pb-8 sm:pb-4">
      {/* 백그라운드 연결 선 */}
      <div className="absolute top-10 left-8 right-8 h-1 bg-slate-100 rounded-full hidden sm:block"></div>

      {/* 진행된 만큼 채워지는 선 */}
      <div
        className="absolute top-10 left-8 h-1 bg-indigo-500 rounded-full transition-all duration-1000 hidden sm:block"
        style={{
          width: `${((currentStage - 1) / (STAGES.length - 1)) * 100}%`,
        }}
      ></div>

      <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
        {STAGES.map((stage, index) => {
          const isCompleted = stage.id < currentStage;
          const isCurrent = stage.id === currentStage;
          const isPending = stage.id > currentStage;

          return (
            <div
              key={stage.id}
              className="flex sm:flex-col items-center gap-4 sm:gap-3 group"
            >
              {/* 아이콘 원형 뱃지 */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-500 ${
                  isCompleted
                    ? "bg-indigo-500 border-indigo-100 text-white shadow-md"
                    : isCurrent
                      ? "bg-white border-indigo-500 text-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]"
                      : "bg-white border-slate-100 text-slate-300"
                }`}
              >
                {isCompleted ? (
                  <i className="bx bx-check text-2xl animate-in zoom-in"></i>
                ) : (
                  <i
                    className={`bx ${stage.icon} text-xl ${isCurrent ? "animate-pulse" : ""}`}
                  ></i>
                )}
              </div>

              {/* 단계 텍스트 */}
              <div className="sm:text-center">
                <p
                  className={`text-[11px] font-black uppercase tracking-wider mb-0.5 ${
                    isCurrent ? "text-indigo-500" : "text-slate-400"
                  }`}
                >
                  Step 0{stage.id}
                </p>
                <p
                  className={`text-[14px] font-bold ${
                    isCompleted || isCurrent
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {stage.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
