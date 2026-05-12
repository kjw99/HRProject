"use client";

import React, { useState } from "react";
import ControlPanel from "./ControlPanel";
import ResultsPanel from "./ResultsPanel";
import {
  BackendPosition,
  BackendCandidate,
  UIGeneratedQuestion,
  QuestionGeneratePayload,
  QuestionSavePayload,
} from "@/types/interviewer";
import { question as questionAPI } from "@/lib/interviewer/questions";
interface AgentClientProps {
  initialPositions: BackendPosition[];
  initialCandidates: BackendCandidate[];
}

export default function AgentClient({
  initialPositions,
  initialCandidates,
}: AgentClientProps) {
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
    null,
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
    null,
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    UIGeneratedQuestion[]
  >([]);

  // 💡 AI 질문 생성 (GeneratePayload 규격 맞춤)
  const handleGenerate = async (additionalRequest?: string) => {
    if (!selectedPositionId || !selectedCandidateId) return;
    setIsGenerating(true);

    try {
      const payload: QuestionGeneratePayload = {
        positionId: selectedPositionId,
        candidateId: selectedCandidateId,
        questionCount: 3,
        additionalRequest: additionalRequest || "",
      };

      const rawQuestions = await questionAPI.generateQuestions(payload);

      // 프론트엔드 렌더링을 위해 고유 ID 부여
      const uiQuestions: UIGeneratedQuestion[] = rawQuestions.map((q, idx) => ({
        ...q,
        id: `gen-q-${Date.now()}-${idx}`,
      }));

      setGeneratedQuestions((prev) => [...prev, ...uiQuestions]);
    } catch (error) {
      console.error(error);
      alert("질문 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 💡 데이터 저장 (SavePayload 규격 맞춤)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: QuestionSavePayload = {
        positionId: selectedPositionId || undefined,
        candidateId: selectedCandidateId || undefined,
        questions: generatedQuestions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          evaluationIntent: q.evaluationIntent,
          generationBasis: q.generationBasis,
        })),
      };

      const success = await questionAPI.saveQuestions(payload);
      if (success) alert("저장 완료!");
    } catch (error) {
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-175">
      <ControlPanel
        positions={initialPositions}
        candidates={initialCandidates}
        selectedPositionId={selectedPositionId}
        setSelectedPositionId={(id) => {
          setSelectedPositionId(id);
          setSelectedCandidateId(null);
        }}
        selectedCandidateId={selectedCandidateId}
        setSelectedCandidateId={setSelectedCandidateId}
        isGenerating={isGenerating}
        onGenerateAI={() => handleGenerate()}
      />
      <ResultsPanel
        isGenerating={isGenerating}
        questions={generatedQuestions}
        onSave={handleSave}
        isSaving={isSaving}
        onAdditionalChat={(msg) => handleGenerate(msg)} // 추가 요청사항 처리 연결
      />
    </div>
  );
}
