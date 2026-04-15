import React from "react";
import MediaCheck from "@/components/applicant/interview/MediaCheck";

export default function InterviewReadyPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="text-center space-y-3">
        <h1 className="text-[28px] sm:text-[32px] font-black text-slate-900 tracking-tight">
          AI 심층 면접 대기실
        </h1>
        <p className="text-slate-500 font-medium">
          면접 시작 전 장비 상태를 확인하고 안내사항을 숙지해 주세요.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* 🎥 좌측: 미디어 체크 (Client Component) */}
        <MediaCheck />

        {/* 📜 우측: 안내 사항 */}
        <div className="space-y-6 bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-sm">
          <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2">
            <i className="bx bx-info-circle text-indigo-500"></i> 면접 유의사항
          </h2>

          <ul className="space-y-4">
            {[
              {
                title: "조용한 환경 유지",
                desc: "주변 소음이 없는 독립된 공간에서 진행해 주세요.",
              },
              {
                title: "안정적인 네트워크",
                desc: "끊김 없는 면접을 위해 안정적인 Wi-Fi나 유선랜을 권장합니다.",
              },
              {
                title: "정면 응시",
                desc: "카메라를 정면으로 응시하며 답변해 주시면 AI가 더 잘 인식합니다.",
              },
              {
                title: "시간 준수",
                desc: "질문당 답변 시간 제한이 있으니 타이머를 확인해 주세요.",
              },
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-800">
                    {item.title}
                  </p>
                  <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-6">
            <p className="text-[12px] text-amber-700 font-bold leading-relaxed">
              <i className="bx bx-error-circle"></i> 본 면접은 대리 응시 및 부정
              행위를 방지하기 위해 녹화 및 분석이 진행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
