from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import model_to_json, optional_text
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
    QuestionReviewOutput,
)


def build_question_revision_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    questions: list[GeneratedQuestion],
    review: QuestionReviewOutput,
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
Revise the draft interview questions based on the review feedback below.

Position: {data.position_name}
Question count to revise now: {data.question_count}
Overall requested question count: {data.final_question_count}
Additional request: {optional_text(data.additional_request)}

## Fit analysis
{model_to_json(analysis)}

## Current questions
{model_to_json(questions)}

## Review result
{model_to_json(review)}

## Already reused questions
{model_to_json(data.reused_questions)}

Revision rules:
- Return exactly {data.question_count} revised questions.
- Keep strong questions when possible and revise only what is necessary.
- Do not duplicate or closely paraphrase already reused questions.
- Keep the questions concrete, evidence-based, and job relevant.
- Avoid protected or irrelevant personal information.
- Each item must include only question_text, evaluation_intent, generation_basis, and question_keywords.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
