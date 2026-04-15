import React from "react";

interface MetricData {
  value: string;
  change: string;
  isUp: boolean;
  label: string;
}

interface StatCardsProps {
  metrics: Record<string, MetricData>;
}

export default function StatCards({ metrics }: StatCardsProps) {
  return (
    // 💡 gap-6을 gap-4(모바일) sm:gap-5(PC)로 줄여서 카드 사이 간격을 조밀하게 만들었습니다.
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {Object.entries(metrics).map(([key, data], idx) => (
        // 💡 p-6 -> p-5, rounded-24px -> rounded-20px 로 박스 크기 축소
        <div
          key={key}
          className="bg-white p-5 rounded-[20px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start mb-3">
            {/* 💡 아이콘 박스 크기(w-10 h-10) 및 폰트 크기(text-xl) 축소 */}
            <div
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-xl shadow-inner ${
                idx === 0
                  ? "bg-blue-50 text-blue-500"
                  : idx === 1
                    ? "bg-purple-50 text-purple-500"
                    : idx === 2
                      ? "bg-emerald-50 text-emerald-500"
                      : "bg-rose-50 text-rose-500"
              }`}
            >
              <i
                className={`bx ${
                  idx === 0
                    ? "bx-network-chart"
                    : idx === 1
                      ? "bx-chip"
                      : idx === 2
                        ? "bx-dollar-circle"
                        : "bx-error-circle"
                }`}
              ></i>
            </div>
            {/* 💡 증감율 뱃지 폰트 크기 text-[11px] 로 축소 */}
            <div
              className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-[8px] ${
                data.isUp
                  ? idx === 3 || idx === 2
                    ? "text-rose-600 bg-rose-50"
                    : "text-emerald-600 bg-emerald-50" // 비용/에러율 상승은 빨간색
                  : idx === 3 || idx === 2
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-rose-600 bg-rose-50"
              }`}
            >
              <i
                className={`bx ${data.isUp ? "bx-trending-up" : "bx-trending-down"}`}
              ></i>
              {data.change}
            </div>
          </div>
          {/* 💡 라벨 글자 크기 text-[12px] 로 축소 */}
          <h3 className="text-slate-500 font-bold text-[12px] mb-0.5">
            {data.label}
          </h3>
          {/* 💡 메인 밸류 숫자 크기 text-[32px] -> text-[26px] 로 축소 */}
          <p className="text-[26px] font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
            {data.value}
          </p>
        </div>
      ))}
    </div>
  );
}
