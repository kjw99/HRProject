"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useQuestionGenerationJob } from "@/components/hr/question-generation/QuestionGenerationJobProvider";
import ControlPanel from "./ControlPanel";
import ResultsPanel from "./ResultsPanel";
import {
  BackendPosition,
  BackendCandidate,
  QuestionSavePayload,
} from "@/types/interviewer";
import { getApiErrorMessage } from "@/lib/hr/api-error";
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
  const [isSaving, setIsSaving] = useState(false);

  const {
    generatedQuestions,
    startGeneration,
    isCreating,
    isJobActive,
  } = useQuestionGenerationJob();

  const handleGenerate = useCallback(
    async (additionalRequest?: string) => {
      if (!selectedPositionId || !selectedCandidateId) return;

      try {
        await startGeneration({
          positionId: selectedPositionId,
          candidateId: selectedCandidateId,
          questionCount: 10,
          additionalRequest: additionalRequest || "",
        });
      } catch {
        /* toast handled in provider */
      }
    },
    [selectedCandidateId, selectedPositionId, startGeneration],
  );

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

      const result = await questionAPI.saveQuestions(payload);
      toast.success(result.message ?? "저장이 완료되었습니다.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "저장에 실패했습니다."));
    } finally {
      setIsSaving(false);
    }
  };

  const isGenerating = isCreating || isJobActive;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 xl:flex-row xl:items-stretch">
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
        onGenerateAI={() => void handleGenerate()}
      />
      <ResultsPanel
        isGenerating={isGenerating}
        questions={generatedQuestions}
        onSave={() => void handleSave()}
        isSaving={isSaving}
        onAdditionalChat={(msg) => void handleGenerate(msg)}
      />
    </div>
  );
}
