"use client";

import { useState, useEffect } from "react";
import {
  BackendPosition,
  BackendCandidate,
  BackendGeneratedQuestion,
  questionApi,
} from "@/apis/questionApi";
import ControlPanel from "./ControlPanel";
import ResultsPanel from "./ResultsPanel";

const MOCK_POSITIONS: BackendPosition[] = [
  { positionId: 1, positionName: "인사", createdAt: "" },
  { positionId: 2, positionName: "개발", createdAt: "" },
  { positionId: 3, positionName: "프론트", createdAt: "" },
  { positionId: 4, positionName: "백엔드", createdAt: "" },
];

const MOCK_CANDIDATES: BackendCandidate[] = [
  {
    candidate_id: 1,
    position_id: 3,
    name: "김진우",
    application_status: "진행중",
    final_status: "진행중",
    experience_level: "경력",
    meets_preferred_criteria: [],
  },
  {
    candidate_id: 2,
    position_id: 3,
    name: "남건우",
    application_status: "진행중",
    final_status: "진행중",
    experience_level: "신입",
    meets_preferred_criteria: [],
  },
];

export default function AgentClient() {
  const [positions, setPositions] = useState<BackendPosition[]>([]);
  const [candidates, setCandidates] = useState<BackendCandidate[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<BackendGeneratedQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    questionApi.getPositions()
      .then(setPositions)
      .catch(() => setPositions(MOCK_POSITIONS));

    questionApi.getCandidates()
      .then(setCandidates)
      .catch(() => setCandidates(MOCK_CANDIDATES));
  }, []);

  const handlePositionSelect = (id: number | null) => {
    setSelectedPositionId(id);
    setSelectedCandidateId(null);
  };

  const handleGenerate = async () => {
    if (!selectedCandidateId) return;
    setIsGenerating(true);
    setGeneratedQuestions([]);
    try {
      const result = await questionApi.generateQuestions({
        candidateId: selectedCandidateId,
        positionId: selectedPositionId ?? undefined,
        questionCount: 10,
      });
      setGeneratedQuestions(result);
    } catch (e) {
      console.error("Question generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQuestions.length) return;
    setIsSaving(true);
    try {
      await questionApi.saveQuestions({
        positionId: selectedPositionId ?? undefined,
        candidateId: selectedCandidateId ?? undefined,
        questions: generatedQuestions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          evaluationIntent: q.evaluationIntent,
          generationBasis: q.generationBasis,
        })),
      });
    } catch (e) {
      console.error("Question save failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-5 h-full min-h-[640px]">
      <ControlPanel
        positions={positions}
        candidates={candidates}
        selectedPositionId={selectedPositionId}
        setSelectedPositionId={handlePositionSelect}
        selectedCandidateId={selectedCandidateId}
        setSelectedCandidateId={setSelectedCandidateId}
        isGenerating={isGenerating}
        onGenerateAI={handleGenerate}
      />
      <ResultsPanel
        isGenerating={isGenerating}
        questions={generatedQuestions}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
