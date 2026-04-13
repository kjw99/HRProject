"use client"; // 상태 관리가 집중되는 클라이언트 래퍼

import React, { useState } from "react";
import { JobPosting, Candidate, GeneratedQuestion } from "@/types/hr";
import ControlPanel from "../ControlPanel";
import ResultsPanel from "../ResultsPanel";

interface AgentClientProps {
  jobPostings: JobPosting[];
  candidates: Candidate[];
}

export default function AgentClient({
  jobPostings,
  candidates,
}: AgentClientProps) {
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);

  // 💡 실제 API 호출 로직을 여기에 연동합니다.
  const handleGenerateAI = () => {
    setIsGenerating(true);
    setGeneratedQuestions([]);

    setTimeout(() => {
      setGeneratedQuestions([
        {
          id: 1,
          type: "기술 검증",
          question:
            "이커머스 성능을 30% 개선한 과정에서 Lighthouse의 어떤 지표(LCP, TTI 등)를 중점적으로 모니터링하셨나요?",
          intent: "성과 진위 및 트러블슈팅 능력 검증",
          ragContext:
            "지원자의 '성능 30% 개선' 이력과 공고의 '성능 최적화' 스킬 대조",
        },
        {
          id: 2,
          type: "아키텍처 설계",
          question:
            "Vue에서 React로 전환할 때 상태 관리 전략은 어떻게 재수립하셨나요?",
          intent: "아키텍처 이해도 및 프레임워크 전환 적응력 측정",
          ragContext: "지원자의 'Vue -> React 마이그레이션' 이력 기반 도출",
        },
      ]);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      <ControlPanel
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
        selectedCandidate={selectedCandidate}
        setSelectedCandidate={setSelectedCandidate}
        isGenerating={isGenerating}
        onGenerateAI={handleGenerateAI}
        jobPostings={jobPostings}
        candidates={candidates}
      />
      <ResultsPanel
        isGenerating={isGenerating}
        generatedQuestions={generatedQuestions}
      />
    </div>
  );
}
