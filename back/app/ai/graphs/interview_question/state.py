from typing import TypedDict

from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    InterviewQuestionGenerationOutput,
    QuestionFitAnalysis,
    QuestionPlan,
    QuestionReviewOutput,
)


class InterviewQuestionGraphState(TypedDict, total=False):
    generation_input: InterviewQuestionGenerationInput
    analysis: QuestionFitAnalysis
    question_plan: QuestionPlan
    candidate_questions: list[GeneratedQuestion]
    questions: list[GeneratedQuestion]
    review: QuestionReviewOutput
    revision_count: int
    final_output: InterviewQuestionGenerationOutput
