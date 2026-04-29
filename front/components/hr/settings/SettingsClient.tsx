"use client";

import React, { useState } from "react";
import KnowledgeBase from "./KnowledgeBase";
import PersonaConfig from "./PersonaConfig";
import Playground from "./Playground";
import SettingsHeader from "./SettingsHeader";

export default function SettingsClient() {
  const [tone, setTone] = useState("analytical");
  const [techWeight, setTechWeight] = useState(70);
  const [customPrompt, setCustomPrompt] = useState("당신은 지원자의 기술적 역량과 조직 적합성을 균형 있게 평가하는 AI 면접관입니다. 질문을 통해 지원자의 경험과 사고 방식을 깊이 있게 탐구하세요.");
  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col bg-slate-50/30 p-2 sm:p-6 lg:p-8 rounded-[40px]">
      <SettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 flex-1 min-h-0">
        {/* Left Column */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          <KnowledgeBase />
          <PersonaConfig
            tone={tone}
            setTone={setTone}
            techWeight={techWeight}
            setTechWeight={setTechWeight}
            prompt={customPrompt}
            setPrompt={setCustomPrompt}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 xl:col-span-4 h-[800px] lg:h-auto lg:sticky lg:top-8">
          <Playground tone={tone} techWeight={techWeight} prompt="" />
        </div>
      </div>
    </div>
  );
}
